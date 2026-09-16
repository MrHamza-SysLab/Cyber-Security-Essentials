import HumanFirewallGame from './module 1/build-the-human-firewall/HumanFirewallGame'
import HackersTargetBoardGame from './module 1/hackers-target-board/HackersTargetBoardGame'
import SecurityGuardGame from './module 1/security-guard-pass-or-block/SecurityGuardGame'
import SocialEngineeringGame from './module 1/social-engineering-trap-detector/SocialEngineeringGame'
import ThreatSpotterGame from './module 1/threat-spotter-catch-the-impostor/ThreatSpotterGame'
import PasswordStrengthCrackerGame from './module 2/password-strength-cracker/PasswordStrengthCrackerGame'
import MFAGatekeeperGame from './module 2/mfa-gatekeeper/MFAGatekeeperGame'
import AccountHijackSimulatorGame from './module 2/account-hijack-simulator/AccountHijackSimulatorGame'
import SafeShareDecisionEngineGame from './module 2/safe-share-decision-engine/SafeShareDecisionEngineGame'
import PermissionMatrixSorterGame from './module 2/permission-matrix-sorter/PermissionMatrixSorterGame'

export const GAMES = {
  'security-guard-pass-or-block': SecurityGuardGame,
  'hackers-target-board': HackersTargetBoardGame,
  'threat-spotter-catch-the-impostor': ThreatSpotterGame,
  'build-the-human-firewall': HumanFirewallGame,
  'social-engineering-trap-detector': SocialEngineeringGame,
  'password-strength-cracker': PasswordStrengthCrackerGame,
  'mfa-gatekeeper': MFAGatekeeperGame,
  'account-hijack-simulator': AccountHijackSimulatorGame,
  'safe-share-decision-engine': SafeShareDecisionEngineGame,
  'permission-matrix-sorter': PermissionMatrixSorterGame,
}
