export const UserLevel = {
  admin: 0,
  member: 1,
  guest: 2,
  setup: 100,
  unknown: 255,
}


export class BluenetSettings {
  encryptionEnabled = true

  adminKey  : Buffer = null
  memberKey : Buffer = null
  guestKey  : Buffer = null
  setupKey  : Buffer = null

  referenceId  = null
  sessionNonce = null

  initializedKeys  = false
  temporaryDisable = false

  userLevel = UserLevel.unknown


  loadKeys(encryptionEnabled, adminKey : string = null, memberKey : string = null, guestKey : string = null, referenceId) {
    this.encryptionEnabled = encryptionEnabled;

    this.adminKey  = this._prepKey(adminKey);
    this.memberKey = this._prepKey(memberKey);
    this.guestKey  = this._prepKey(guestKey);

    this.referenceId = referenceId;

    this.initializedKeys = true;
    this.determineUserLevel();
  }

  _prepKey(key) {
    if (key.length === 16) {
      return Buffer.from(key, 'ascii');
    }
    else if (key.length === 32) {
      return Buffer.from(key, 'hex')
    }
    else {
      throw "Invalid Key: " + key;
    }
  }

  determineUserLevel() {
    if (this.adminKey.length == 16) {
      this.userLevel = UserLevel.admin
    }
    else if (this.memberKey.length == 16) {
      this.userLevel = UserLevel.member
    }
    else if (this.guestKey.length == 16) {
      this.userLevel = UserLevel.guest;
    }
    else {
      this.userLevel = UserLevel.unknown
      this.initializedKeys = false
    }
  }

  invalidateSessionNonce() {
    this.sessionNonce = null
  }

  setSessionNonce(this, sessionNonce) {
    this.sessionNonce = sessionNonce
  }

  loadSetupKey(this, setupKey) {
    this.setupKey = setupKey
    this.userLevel = UserLevel.setup
  }

  exitSetup() {
    this.setupKey = null
    this.determineUserLevel()
  }

  disableEncryptionTemporarily() {
    this.temporaryDisable = true
  }

  restoreEncryption() {
    this.temporaryDisable = false
  }

  isTemporarilyDisabled() {
    return this.temporaryDisable
  }

  isEncryptionEnabled() {
    if (this.temporaryDisable) {
      return false
    }
    return this.encryptionEnabled
  }
}



