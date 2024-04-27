# Employee Tracker

## Description
This is a node.js application that uses inquirer to accept user input and mysql2 to translate that user input into database queries allowing users to view data, update employees, and add employees, roles, and departments.

## Table of Contents

  - [Installation](#installation)
  - [Usage](#usage)
  - [Badges](#badges)
  - [Contribution](#contribution)
  - [Contact Me](#contact)

  ## Installation
  Users will need to install Node.js to run this file, and from there users can use the npm i command to install any other required dependencies

  ## Usage
  This project should be used to manage a database described by the schema.sql file that is intended to store managers, employees, departments, and roles. I have somewhat twisted the intention of the project by using it to describe the current Lions roster, but it will still function for its original purpose, and to use this project it's highly recommended you only use my seeds.sql as an example or starting point. The only point of editing that might done to the index.js for a more general purpose is to alter the validate function for the salary input on the addRole() function on line 375, as it presumes entered items are NFL players and are bound by the NFL's base salary of $795,000.
  To use this project simply open the command terminal on the file that contains the index.js and run
  ```
    npm i
  ```
  and then

  ```
    npm start
  ```
  to make the prompts appear and then simply start answering the questions as posed. [Here](https://drive.google.com/file/d/1zKZuKFQZmZCSDvnHtaK3cOm2lGsNuR1T/view) is an example video to give you an idea of how this works before you commit to downloading it, that link should open to a google drive page, but if it has gone down or is otherwise unavailable, it is also included in the repo files.


  ## Badges
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  ## How to Contribute
  Users interested in contributing should feel free to make forks of this project. An obvious flaw in its current implementation is that I haven't added a delete option for this application, meaning that things can be added using the application but to delete them you'd have to open the database and run DELETE queries manually. Other database sanitization might be worthwhile, such as validating that there are no circular chains of command as there is nothing stopping a user from naming an employee as their own manager or naming one of their subordinates or an employee from a different department as their manager. Also, in a real world workforce, salaries for specific roles usually only act as a base pay, so adding the ability to add an employee specific raise might be useful as well. Probably the most likely thing to cause an issue is that several places use the name as an identifier instead of the employee or manager id, this is simply because I thought it would be user unfriendly to show them a list of numbers and ask them to choose one, but it's certianly possible that in the future two people with the same name work for the organization and it causes difficulty in determining who is the manager of whom.

  ## Contact
  My github is [danaptoneil](https://github.com/danaptoneil)

   My email is is danpatoneil@gmail.com

  ## License
  This project is published under the [MIT](https://opensource.org/licenses/MIT) license
