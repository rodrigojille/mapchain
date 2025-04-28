// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GamificationContract is Ownable {
    struct UserProfile {
        uint256 totalPoints;
        uint256 propertyCount;
        uint256 valuationsReceived;
        uint256 valuationsGiven;
        uint256 accuracySum;
        uint256 accuracyCount;
        mapping(string => bool) achievements;
    }

    mapping(address => UserProfile) private userProfiles;
    mapping(string => bool) private validAchievements;

    event PointsAwarded(address indexed user, string action, uint256 points);
    event AchievementUnlocked(address indexed user, string achievementId);
    event PropertyAdded(address indexed user);
    event ValuationReceived(address indexed user);
    event ValuationGiven(address indexed user, uint256 accuracy);

    constructor() {
        // Initialize valid achievements
        validAchievements["first_property"] = true;
        validAchievements["first_valuation"] = true;
        validAchievements["accuracy_master"] = true;
        validAchievements["property_collector"] = true;
        validAchievements["valuation_expert"] = true;
    }

    function awardPoints(address user, string memory action, uint256 points) external onlyOwner {
        UserProfile storage profile = userProfiles[user];
        profile.totalPoints += points;
        emit PointsAwarded(user, action, points);
    }

    function _unlockAchievement(address user, string memory achievementId) private {
        require(validAchievements[achievementId], "Invalid achievement");
        UserProfile storage profile = userProfiles[user];
        if (!profile.achievements[achievementId]) {
            profile.achievements[achievementId] = true;
            emit AchievementUnlocked(user, achievementId);
        }
    }

    function unlockAchievement(address user, string memory achievementId) external onlyOwner {
        _unlockAchievement(user, achievementId);
    }

    function addProperty(address user) external onlyOwner {
        UserProfile storage profile = userProfiles[user];
        profile.propertyCount++;
        emit PropertyAdded(user);

        // Check for achievements
        if (profile.propertyCount == 1) {
            _unlockAchievement(user, "first_property");
        }
        if (profile.propertyCount == 10) {
            _unlockAchievement(user, "property_collector");
        }
    }

    function recordValuation(address user, uint256 accuracy) external onlyOwner {
        UserProfile storage profile = userProfiles[user];
        profile.valuationsGiven++;
        profile.accuracySum += accuracy;
        profile.accuracyCount++;
        emit ValuationGiven(user, accuracy);

        // Check for achievements
        if (profile.valuationsGiven == 1) {
            _unlockAchievement(user, "first_valuation");
        }
        if (profile.valuationsGiven == 50) {
            _unlockAchievement(user, "valuation_expert");
        }

        // Check accuracy master achievement
        if (profile.valuationsGiven >= 10) {
            uint256 avgAccuracy = profile.accuracySum / profile.accuracyCount;
            if (avgAccuracy >= 90) {
                _unlockAchievement(user, "accuracy_master");
            }
        }
    }

    function receiveValuation(address user) external onlyOwner {
        UserProfile storage profile = userProfiles[user];
        profile.valuationsReceived++;
        emit ValuationReceived(user);
    }

    function getUserProfile(address user) external view returns (
        uint256 totalPoints,
        uint256 propertyCount,
        uint256 valuationsReceived,
        uint256 valuationsGiven,
        uint256 accuracy
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.totalPoints,
            profile.propertyCount,
            profile.valuationsReceived,
            profile.valuationsGiven,
            profile.accuracyCount > 0 ? profile.accuracySum / profile.accuracyCount : 0
        );
    }

    function hasAchievement(address user, string memory achievementId) external view returns (bool) {
        return userProfiles[user].achievements[achievementId];
    }
}
