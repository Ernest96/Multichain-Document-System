// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MidTermGradeStorage {
    struct Grade {
        uint8 value;   // 0..10
        bool exists;
    }

    mapping(string => Grade) private midGrades;

    event MidTermGradeUpdated(string studentId, uint8 grade);

    function setMidTermGrade(string calldata studentId, uint8 grade) external {
        require(bytes(studentId).length > 0, "Empty studentId!");
        require(grade <= 10, "Invalid grade!");

        midGrades[studentId] = Grade({ value: grade, exists: true });
        emit MidTermGradeUpdated(studentId, grade);
    }

    function getMidTermGrade(string calldata studentId) external view returns (uint8) {
        require(midGrades[studentId].exists, "Student not found");
        return midGrades[studentId].value;
    }

    function hasMidTermGrade(string calldata studentId) external view returns (bool) {
        return midGrades[studentId].exists;
    }
}
