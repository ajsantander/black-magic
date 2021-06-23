//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";


contract Larry {
  uint public yearsLived;

  function age(uint yearsToAge) public {
    yearsLived += yearsToAge;
  }
}
