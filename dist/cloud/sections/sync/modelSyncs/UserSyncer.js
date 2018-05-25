"use strict";
/**
 *
 * Sync the user from the cloud to the database.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const syncUtil_1 = require("../shared/syncUtil");
const cloudAPI_1 = require("../../../cloudAPI");
const SyncingBase_1 = require("./SyncingBase");
const Util_1 = require("../../../../util/Util");
const transferUser_1 = require("../../../transferData/transferUser");
const Log_1 = require("../../../../logging/Log");
class UserSyncer extends SyncingBase_1.SyncingBase {
    download() {
        return cloudAPI_1.CLOUD.forUser(this.userId).getUserData();
    }
    sync(store) {
        let state = store.getState();
        this.userId = state.user.userId;
        return this.download()
            .then((userData) => {
            let userInState = store.getState().user;
            this.syncDown(userInState, userData);
            return Promise.all(this.transferPromises);
        })
            .then(() => { return this.actions; });
    }
    syncDown(userInState, userInCloud) {
        if (userInCloud.profilePicId && userInState.picture === null || (userInCloud.profilePicId && (userInCloud.profilePicId !== userInState.pictureId))) {
            // user should have A or A DIFFERENT profile picture according to the cloud
            let toPath = Util_1.Util.getPath(this.userId + '.jpg');
            this.transferPromises.push(cloudAPI_1.CLOUD.downloadProfileImage(toPath)
                .then((picturePath) => {
                this.actions.push({ type: 'USER_APPEND', data: { picture: picturePath, pictureId: userInCloud.profilePicId } });
            }).catch((err) => { Log_1.LOGe.cloud("UserSyncer: Could not download profile picture to ", toPath, ' err:', err); }));
        }
        if (syncUtil_1.shouldUpdateLocally(userInState, userInCloud)) {
            this.transferPromises.push(transferUser_1.transferUser.updateLocal(this.actions, { cloudData: userInCloud }));
        }
        else if (syncUtil_1.shouldUpdateInCloud(userInState, userInCloud)) {
            this.transferPromises.push(transferUser_1.transferUser.updateOnCloud({ localData: userInState, cloudId: userInCloud.id }));
        }
    }
}
exports.UserSyncer = UserSyncer;
//# sourceMappingURL=UserSyncer.js.map