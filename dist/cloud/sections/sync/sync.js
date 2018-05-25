"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudAPI_1 = require("../../cloudAPI");
const Log_1 = require("../../../logging/Log");
const AppUtil_1 = require("../../../util/AppUtil");
const syncPowerUsage_1 = require("./syncPowerUsage");
const syncEvents_1 = require("./syncEvents");
const MessageCenter_1 = require("../../../backgroundProcesses/MessageCenter");
const NotificationHandler_1 = require("../../../backgroundProcesses/NotificationHandler");
const UserSyncer_1 = require("./modelSyncs/UserSyncer");
const SphereSyncer_1 = require("./modelSyncs/SphereSyncer");
const DeviceSyncer_1 = require("./modelSyncs/DeviceSyncer");
const FirmwareBootloaderSyncer_1 = require("./modelSyncs/FirmwareBootloaderSyncer");
const SyncingBase_1 = require("./modelSyncs/SyncingBase");
const EventBus_1 = require("../../../util/EventBus");
const KeySyncer_1 = require("./modelSyncs/KeySyncer");
const Scheduler_1 = require("../../../logic/Scheduler");
const FingerprintSyncer_1 = require("./modelSyncs/FingerprintSyncer");
/**
 * We claim the cloud is leading for the availability of items.
 * @param store
 * @returns {Promise.<TResult>|*}
 */
exports.sync = {
    __currentlySyncing: false,
    sync: function (store, background = true) {
        if (this.__currentlySyncing) {
            Log_1.LOG.info("SYNC: Skip Syncing, sync already in progress.");
            return new Promise((resolve, reject) => { resolve(true); });
        }
        let state = store.getState();
        if (!state.user.userId) {
            // do not sync if we're not logged in
            return;
        }
        let cancelFallbackCallback = Scheduler_1.Scheduler.scheduleBackgroundCallback(() => {
            if (this.__currentlySyncing === true) {
                this.__currentlySyncing = false;
            }
        }, 30000);
        Log_1.LOG.cloud("SYNC: Start Syncing.");
        // set the authentication tokens
        let userId = state.user.userId;
        let accessToken = state.user.accessToken;
        cloudAPI_1.CLOUD.setAccess(accessToken);
        cloudAPI_1.CLOUD.setUserId(userId);
        EventBus_1.eventBus.emit("CloudSyncStarting");
        let globalCloudIdMap = SyncingBase_1.getGlobalIdMap();
        let globalSphereMap = {};
        let actions = [];
        let userSyncer = new UserSyncer_1.UserSyncer(actions, [], globalCloudIdMap);
        Log_1.LOG.info("Sync: START Sync Events.");
        return syncEvents_1.syncEvents(store)
            // in case the event sync fails, check if the user accessToken is invalid, try to regain it if that's the case and try again.
            .catch(getUserIdCheckError(state, store, () => {
            Log_1.LOG.info("Sync: RETRY Sync Events.");
            return this.syncEvents(store);
        }))
            .then(() => {
            Log_1.LOG.info("Sync: DONE Sync Events.");
            Log_1.LOG.info("Sync: START userSyncer sync.");
            return userSyncer.sync(store);
        })
            .catch(getUserIdCheckError(state, store, () => {
            Log_1.LOG.info("Sync: RETRY userSyncer Sync.");
            return userSyncer.sync(store);
        }))
            .then(() => {
            Log_1.LOG.info("Sync: DONE userSyncer sync.");
            Log_1.LOG.info("Sync: START FirmwareBootloader sync.");
            let firmwareBootloaderSyncer = new FirmwareBootloaderSyncer_1.FirmwareBootloaderSyncer(actions, [], globalCloudIdMap);
            return firmwareBootloaderSyncer.sync(store);
        })
            .then(() => {
            Log_1.LOG.info("Sync: DONE FirmwareBootloader sync.");
            Log_1.LOG.info("Sync: START SphereSyncer sync.");
            let sphereSyncer = new SphereSyncer_1.SphereSyncer(actions, [], globalCloudIdMap, globalSphereMap);
            return sphereSyncer.sync(store);
        })
            .then(() => {
            Log_1.LOG.info("Sync: DONE SphereSyncer sync.");
            Log_1.LOG.info("Sync: START KeySyncer sync.");
            let keySyncer = new KeySyncer_1.KeySyncer(actions, [], globalCloudIdMap);
            return keySyncer.sync();
        })
            .then(() => {
            Log_1.LOG.info("Sync: DONE KeySyncer sync.");
            Log_1.LOG.info("Sync: START DeviceSyncer sync.");
            let deviceSyncer = new DeviceSyncer_1.DeviceSyncer(actions, [], globalCloudIdMap);
            return deviceSyncer.sync(state);
        })
            .then(() => {
            Log_1.LOG.info("Sync: DONE DeviceSyncer sync.");
            Log_1.LOG.info("Sync: START Fingerprint sync.");
            let fingerprintSyncer = new FingerprintSyncer_1.FingerprintSyncer(actions, [], globalCloudIdMap, globalSphereMap);
            return fingerprintSyncer.sync(state);
        })
            .then(() => {
            Log_1.LOG.info("Sync: DONE DeviceSyncer sync.");
            Log_1.LOG.info("Sync: START syncPowerUsage.");
            return syncPowerUsage_1.syncPowerUsage(state, actions);
        })
            .then(() => {
            Log_1.LOG.info("Sync: DONE syncPowerUsage.");
            Log_1.LOG.info("Sync: START cleanupPowerUsage.");
            return syncPowerUsage_1.cleanupPowerUsage(state, actions);
        })
            // FINISHED SYNCING
            .then(() => {
            Log_1.LOG.info("SYNC: Finished. Dispatching ", actions.length, " actions!");
            let reloadTrackingRequired = false;
            actions.forEach((action) => {
                action.triggeredBySync = true;
                switch (action.type) {
                    case 'ADD_SPHERE':
                    case 'REMOVE_SPHERE':
                    case 'ADD_LOCATION':
                    case 'REMOVE_LOCATION':
                        reloadTrackingRequired = true;
                        break;
                }
            });
            if (actions.length > 0) {
                store.batchDispatch(actions);
            }
            Log_1.LOG.info("Sync: Requesting notification permissions during updating of the device.");
            NotificationHandler_1.NotificationHandler.request();
            EventBus_1.eventBus.emit("CloudSyncComplete");
            if (reloadTrackingRequired) {
                EventBus_1.eventBus.emit("CloudSyncComplete_spheresChanged");
            }
            Log_1.LOG.info("Sync after: START MessageCenter checkForMessages.");
            MessageCenter_1.MessageCenter.checkForMessages();
            Log_1.LOG.info("Sync after: DONE MessageCenter checkForMessages.");
        })
            .then(() => {
            this.__currentlySyncing = false;
            cancelFallbackCallback();
        })
            .catch((err) => {
            Log_1.LOG.info("SYNC: Failed... Could dispatch ", actions.length, " actions!", actions);
            actions.forEach((action) => {
                action.triggeredBySync = true;
            });
            // if (actions.length > 0) {
            //   store.batchDispatch(actions);
            // }
            this.__currentlySyncing = false;
            cancelFallbackCallback();
            Log_1.LOG.error("SYNC: error during sync:", err);
            throw err;
        });
    }
};
let getUserIdCheckError = (state, store, retryThisAfterRecovery) => {
    return (err) => {
        // perhaps there is a 401, user token expired or replaced. Retry logging in.
        if (err.status === 401) {
            Log_1.LOG.warn("Could not verify user, attempting to login again and retry sync.");
            return cloudAPI_1.CLOUD.login({
                email: state.user.email,
                password: state.user.passwordHash,
                background: true,
            })
                .then((response) => {
                cloudAPI_1.CLOUD.setAccess(response.id);
                cloudAPI_1.CLOUD.setUserId(response.userId);
                store.dispatch({ type: 'USER_APPEND', data: { accessToken: response.id } });
                return retryThisAfterRecovery();
            })
                .catch((err) => {
                Log_1.LOG.info("SYNC: COULD NOT VERIFY USER -- ERROR", err);
                if (err.status === 401) {
                    AppUtil_1.AppUtil.logOut(store, { title: "Access token expired.", body: "I could not renew this automatically. The app will clean up and exit now. Please log in again." });
                }
            });
        }
        else {
            throw err;
        }
    };
};
//# sourceMappingURL=sync.js.map