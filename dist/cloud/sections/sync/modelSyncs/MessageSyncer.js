"use strict";
/**
 *
 * Sync the messages from the cloud to the database.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const syncUtil_1 = require("../shared/syncUtil");
const cloudAPI_1 = require("../../../cloudAPI");
const Util_1 = require("../../../../util/Util");
const SyncingBase_1 = require("./SyncingBase");
const transferMessages_1 = require("../../../transferData/transferMessages");
class MessageSyncer extends SyncingBase_1.SyncingSphereItemBase {
    download() {
        return cloudAPI_1.CLOUD.forSphere(this.cloudSphereId).getActiveMessages();
    }
    _getLocalData(store) {
        let state = store.getState();
        if (state && state.spheres[this.localSphereId]) {
            return state.spheres[this.localSphereId].messages;
        }
        return {};
    }
    sync(store) {
        let userInState = store.getState().user;
        this.userId = userInState.userId;
        return this.download()
            .then((messagesInCloud) => {
            // used to transform the locationId for the triggerLocationIds
            this._constructLocalIdMap();
            let messagesInState = this._getLocalData(store);
            this.syncDown(messagesInState, messagesInCloud);
            // we do NOT sync up.
            return Promise.all(this.transferPromises);
        })
            .then(() => { return this.actions; });
    }
    syncDown(messagesInState, messagesInCloud) {
        let localMessageIdsSynced = {};
        let cloudIdMap = this._getCloudIdMap(messagesInState);
        messagesInCloud.forEach((message_from_cloud) => {
            // check if there is an existing message
            let localId = cloudIdMap[message_from_cloud.id];
            // item exists locally.
            if (localId) {
                cloudIdMap[message_from_cloud.id] = localId;
                localMessageIdsSynced[localId] = true;
                this.syncLocalMessageDown(localId, messagesInState[localId], message_from_cloud);
            }
            else {
                // if the user does not own this message, do not sync it into the local database, it will be handled by the MessageCenter
                if (message_from_cloud.ownerId !== this.userId) {
                    // do nothing.
                }
                else {
                    localId = Util_1.Util.getUUID();
                    let cloudDataForLocal = Object.assign({}, message_from_cloud);
                    cloudDataForLocal['localTriggerLocationId'] = this._getLocalLocationId(message_from_cloud.triggerLocationId);
                    this.transferPromises.push(transferMessages_1.transferMessages.createLocal(this.actions, {
                        localSphereId: this.localSphereId,
                        localId: localId,
                        cloudId: message_from_cloud.id,
                        cloudData: cloudDataForLocal,
                        extraFields: { sent: true, sentAt: message_from_cloud['createdAt'] }
                    })
                        .catch(() => { }));
                }
            }
        });
        return localMessageIdsSynced;
    }
    _getLocalLocationId(cloudId) {
        if (!cloudId) {
            return null;
        }
        return this.globalCloudIdMap.locations[cloudId] || null;
    }
    syncLocalMessageDown(localId, messageInState, message_from_cloud) {
        if (syncUtil_1.shouldUpdateInCloud(messageInState.config, message_from_cloud)) {
            // update in cloud --> not possible for messages. Sent is sent.
        }
        else if (syncUtil_1.shouldUpdateLocally(messageInState.config, message_from_cloud)) {
            // update local
            let cloudDataForLocal = Object.assign({}, message_from_cloud);
            cloudDataForLocal['localTriggerLocationId'] = this._getLocalLocationId(message_from_cloud.triggerLocationId);
            this.transferPromises.push(transferMessages_1.transferMessages.updateLocal(this.actions, {
                localSphereId: this.localSphereId,
                localId: localId,
                cloudId: message_from_cloud.id,
                cloudData: cloudDataForLocal
            }).catch(() => { }));
        }
        if (!messageInState.config.cloudId) {
            this.actions.push({ type: 'UPDATE_MESSAGE_CLOUD_ID', sphereId: this.localSphereId, messageId: localId, data: { cloudId: message_from_cloud.id } });
        }
    }
    ;
    _getCloudIdMap(messagesInState) {
        let cloudIdMap = {};
        let messageIds = Object.keys(messagesInState);
        messageIds.forEach((messageId) => {
            let message = messagesInState[messageId];
            if (message.config.cloudId) {
                cloudIdMap[message.config.cloudId] = messageId;
            }
        });
        return cloudIdMap;
    }
}
exports.MessageSyncer = MessageSyncer;
//# sourceMappingURL=MessageSyncer.js.map