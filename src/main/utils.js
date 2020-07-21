import {ipcMain} from 'electron';
import {info, debug, error} from 'electron-log';
const AthomApi = require('./homey/index.js').AthomApi;
const AthomSettings = require('./homey/index.js').Settings;
const FormData = require('form-data');
const tar = require('tar-stream');
const zlib = require('zlib');
const streamifier = require('streamifier');
const fetch = require('node-fetch');


ipcMain.on('sign-in', async (event) => {
  info('Sign in user');
  let profile = null;
  let activeHomey = null;
  AthomApi._api = null;
  try {
    debug('Initialising Athom API');
    const loginToken = await AthomApi._initApi();
    info("LOGIN TOKEN!", loginToken);
    profile = await getProfile();
    debug('Initialising Athom APi finished');
    debug('Set active Homey');
    activeHomey = await getActiveHomey(profile).catch(error);
  } catch (err) {
    error(err);
    event.reply('error', {error: err});
  }
  const authenticated = !!profile;
  event.reply('sign-in-complete', {authenticated, profile, activeHomey});
});

ipcMain.on('authentication-check', async (event) => {
  info('Check if the user is signed in');
  if (!AthomApi._api) {
    AthomApi._createApi();
  }
  const authenticated = await AthomApi._api.isLoggedIn();
  info('Check if user is authenticated');
  const profile = authenticated ? await getProfile() : null;
  debug('Set active Homey');
  const activeHomey = await getActiveHomey(profile).catch(error);
  info('Check user authenticated completed');
  debug('User authenticated', {authenticated, profile, activeHomey});
  event.reply('authentication-check-complete', {authenticated, profile, activeHomey});
});

ipcMain.on('set-homey', async (event, args) => {
  info('Set active Homey');
  const homey = args.homey;
  try {
    await AthomApi.setActiveHomey(homey);
    const activeHomey = AthomApi._activeHomey || await AthomSettings.get('activeHomey');
    info('Active Homey set');
    debug('New active Homey', activeHomey);
    event.reply('set-homey-complete', {homey: activeHomey});
  } catch (e) {
    error(e);
    event.reply('error', {error: e});
  }
});

ipcMain.on('install-app', async (event, args) => {

  const fileUrl = `https://homey-community-store.s3.eu-central-1.amazonaws.com/com.maxvandelaar.homey-community-store-homeyapp/latest/com.maxvandelaar.homey-community-store-homeyapp-latest.tar.gz`;
  await fetch(fileUrl)
    .then(res => res.buffer())
    .then(async (buffer) => {

      const activeHomey = await AthomApi.getActiveHomey();
      const env = await getEnv(buffer);

      const form = new FormData();
      form.append('app', buffer, {contentType: 'octet-stream', filename: 'com.maxvandelaar.homey-community-store-homeyapp-latest.tar.gz'});
      form.append('debug', 'false');
      form.append('env', env);
      form.append('purgeSettings', 'false');

      const postResponse = await fetch(`${activeHomey.devkit._baseUrl}${activeHomey.devkit._basePath}`, {
        method: 'POST', body: form, headers: {
          Authorization: `Bearer ${activeHomey._token}`
        }
      });
      if (!postResponse.ok) {
        error(postResponse.statusText);
        event.reply('install-app-complete', {error: postResponse.statusText});
      } else {
        const result = await postResponse.json();
        event.reply('install-app-complete', {result});
        info('App installed', result);
      }
    });
});

async function getActiveHomey(profile){
  let activeHomey = AthomApi._activeHomey || await AthomSettings.get('activeHomey');
  if (profile && !activeHomey) {
    if (profile.homeys.length > 0) {
      await AthomApi.setActiveHomey(profile.homeys[0]).catch(error);
    }
  }
  return AthomApi._activeHomey || await AthomSettings.get('activeHomey');
}

function getProfile(){
  return AthomApi.getProfile();
}

async function getEnv(buffer) {
  const {env} = await untar(buffer).catch(error);
  return env || {};
}

function untar(buffer) {
  return new Promise((resolve, reject) => {
    const textData = [];
    let env = {};
    const extract = tar.extract();
    // Extract method accepts each tarred file as entry, separating header and stream of contents:
    extract.on('entry', (header, stream, next) => {
      const chunks = [];
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      stream.on('error', (err) => {
        reject(err);
      });
      stream.on('end', () => {
        // We concatenate chunks of the stream into string and push it to array, which holds contents of each file in .tar.gz:
        const text = Buffer.concat(chunks).toString('utf8');
        textData.push(text);
        if (header.name === 'env.json') {
          env = text;
          extract.destroy();
          resolve({env});
        }
        next();
      });
      stream.resume();
    });
    extract.on('finish', () => {
      // We return array of tarred files's contents:
      resolve({env});
    });
    // We unzip buffer and convert it to Readable Stream and then pass to tar-stream's extract method:
    streamifier.createReadStream(zlib.unzipSync(buffer)).pipe(extract);
  });
}

