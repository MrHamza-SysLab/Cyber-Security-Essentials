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
import SearchPoisoningInspectorGame from './module 3/search-poisoning-inspector/SearchPoisoningInspectorGame'
import DomainSpotterGame from './module 3/domain-spotter/DomainSpotterGame'
import FakeLoginDestroyerGame from './module 3/fake-login-destroyer/FakeLoginDestroyerGame'
import ExtensionPopupCleanerGame from './module 3/extension-popup-cleaner/ExtensionPopupCleanerGame'
import ParkingLotBaitGame from './module 4/parking-lot-bait/ParkingLotBaitGame'
import ThreatTypeCategorizerGame from './module 4/threat-type-categorizer/ThreatTypeCategorizerGame'
import PatchSoftwareAuditorGame from './module 4/patch-software-auditor/PatchSoftwareAuditorGame'
import CriticalIncidentProtocolGame from './module 4/critical-incident-protocol/CriticalIncidentProtocolGame'
import PermissionAuditorBlitzGame from './module 5/permission-auditor-blitz/PermissionAuditorBlitzGame'
import SmishingTextDetectiveGame from './module 5/smishing-text-detective/SmishingTextDetectiveGame'
import WirelessRiskAnalyzerGame from './module 5/wireless-risk-analyzer/WirelessRiskAnalyzerGame'
import PrivacyIndicatorTrackerGame from './module 5/privacy-indicator-tracker/PrivacyIndicatorTrackerGame'
import OfficeDeskInspectionGame from './module 6/office-desk-inspection/OfficeDeskInspectionGame'
import DoorwayDefenderGame from './module 6/doorway-defender/DoorwayDefenderGame'
import ImpostorSpotterGame from './module 6/impostor-spotter/ImpostorSpotterGame'
import VishingPublicShieldGame from './module 6/vishing-public-shield/VishingPublicShieldGame'
import ClassificationSorterGame from './module 7/classification-sorter/ClassificationSorterGame'
import ChannelGuardGame from './module 7/channel-guard/ChannelGuardGame'
import ScreenshotInspectorGame from './module 7/screenshot-inspector/ScreenshotInspectorGame'
import PrivacyIncidentResponseGame from './module 7/privacy-incident-response/PrivacyIncidentResponseGame'
import FirstResponderGame from './module 8/first-responder/FirstResponderGame'
import SocIncidentHotlineGame from './module 8/soc-incident-hotline/SocIncidentHotlineGame'
import PitfallChallengeGame from './module 8/pitfall-challenge/PitfallChallengeGame'

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
  'search-poisoning-inspector': SearchPoisoningInspectorGame,
  'domain-spotter': DomainSpotterGame,
  'fake-login-destroyer': FakeLoginDestroyerGame,
  'extension-popup-cleaner': ExtensionPopupCleanerGame,
  'parking-lot-bait': ParkingLotBaitGame,
  'threat-type-categorizer': ThreatTypeCategorizerGame,
  'patch-software-auditor': PatchSoftwareAuditorGame,
  'critical-incident-protocol': CriticalIncidentProtocolGame,
  'permission-auditor-blitz': PermissionAuditorBlitzGame,
  'smishing-text-detective': SmishingTextDetectiveGame,
  'wireless-risk-analyzer': WirelessRiskAnalyzerGame,
  'privacy-indicator-tracker': PrivacyIndicatorTrackerGame,
  'office-desk-inspection': OfficeDeskInspectionGame,
  'doorway-defender': DoorwayDefenderGame,
  'impostor-spotter': ImpostorSpotterGame,
  'vishing-public-shield': VishingPublicShieldGame,
  'classification-sorter': ClassificationSorterGame,
  'channel-guard': ChannelGuardGame,
  'screenshot-inspector': ScreenshotInspectorGame,
  'privacy-incident-response': PrivacyIncidentResponseGame,
  'first-responder': FirstResponderGame,
  'soc-incident-hotline': SocIncidentHotlineGame,
  'pitfall-challenge': PitfallChallengeGame,
}
