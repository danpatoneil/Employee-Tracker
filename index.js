const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
// simply connects to the db created by running schema and then seeds
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "root",
    database: "employees_db",
  },
  console.log("connected")
);

// this function brings the user to the "main menu", it should be run at the end of every user option except for quit
function start() {
  inquirer
    .prompt({
      type: "list",
      name: "opening",
      message: "What do you want to do?",
      choices: [
        "Veiw All Employees",
        "Veiw Employees by Manager",
        "Veiw Employees by Department",
        "Add Employee",
        "Update Employee",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
        "Quit",
      ],
    })
    .then((answers) => {
      // a switch case controls which helper function gets called
      let userChoice = answers.opening;
      switch (userChoice) {
        case "Veiw All Employees":
          viewEmployees();
          break;

        case "Veiw Employees by Manager":
          viewEmployeesByManager();
          break;

        case "Veiw Employees by Department":
          viewEmployeesByDepartment();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee":
          chooseEmployee();
          break;

        case "View All Roles":
          viewRoles();
          break;

        case "Add Role":
          addRole();
          break;

        case "View All Departments":
          viewDepartments();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Quit":
          db.end();
          break;

        default:
          break;
      }
    });
}

//simply prints a table of all employees ordered by id, includes left joins to the roles and departments tables and also a self join for the managers' names
function viewEmployees() {
  db.query(
    `SELECT emp.id, emp.first_name as "First Name", emp.last_name as "Last Name", title, department_name as department, salary, IFNULL(CONCAT(man.first_name, " ", man.last_name), "") as Manager
        FROM employees AS emp
        LEFT JOIN employees AS man
        ON emp.manager_id = man.id
        LEFT JOIN roles
        ON roles.id = emp.role_id
        LEFT JOIN departments
        ON roles.department_id = departments.id
        ORDER BY emp.id ASC`,
    (err, res) => {
      err ? console.error(err) : console.table(res), start();
    }
  );
}

// similar to viewEmployees, but for the table of departments
function viewDepartments() {
  //first_name, last_name, title, salary
  db.query(
    "SELECT id, department_name AS department FROM departments ORDER BY department_name ASC",
    (err, res) => {
      err ? console.error(err) : console.table(res), start();
    }
  );
}

// this one is also the same, but for the roles table
function viewRoles() {
  //first_name, last_name, title, salary
  db.query(
    "SELECT roles.id, title, salary, department_name as department FROM roles LEFT JOIN departments ON roles.department_id = departments.id ORDER BY salary DESC",
    (err, res) => {
      err ? console.error(err) : console.table(res), start();
    }
  );
}

// this queries the user for what the new employee's name, role, and manager will be, and adds them to the database
function addEmployee() {
  db.query("SELECT id, title FROM roles", (err, res) => {
    if (err) console.error(err);
    else {
      const roles = res;
      db.query(
        'SELECT id, CONCAT(first_name, " ", last_name) as managerName FROM employees',
        (err, res) => {
          if (err) console.error(err);
          else {
            const managers = res;
            // console.log(roles);
            // console.log(managers);
            managers.push({
              id: null,
              managerName: "None",
            });
            inquirer
              .prompt([
                {
                  type: "input",
                  name: "first_name",
                  message: "What is the employee's first name?",
                },

                {
                  type: "input",
                  name: "last_name",
                  message: "What is the employee's last name?",
                },
                {
                  type: "list",
                  name: "roleName",
                  message: "What is the employee's role",
                  choices: roles.map(({ title }) => title),
                },
                {
                  type: "list",
                  name: "managerName",
                  message: "Who will be this employee's manager",
                  choices: managers.map(({ managerName }) => managerName),
                },
              ])
              .then((answers) => {
                let { first_name, last_name, roleName, managerName } = answers;
                const role = roles.find((obj) => obj.title === roleName);
                const manager = managers.find(
                  (obj) => obj.managerName === managerName
                );
                const newEmployee = {
                  first_name,
                  last_name,
                  role_id: role.id,
                  manager_id: manager.id,
                };
                db.query(
                  "INSERT INTO employees SET ?",
                  newEmployee,
                  (err, res) => {
                    err
                      ? console.error(err)
                      : console.log(
                          `Employee ${first_name} ${last_name} added`
                        ),
                      viewEmployees();
                  }
                );
              });
          }
        }
      );
    }
  });
}

// the udpate employee function actually runs this, which runs the updateEmployee function afterwards. It asks for which employee the user wants to update and passes that to the next function
function chooseEmployee() {
  db.query(
    'SELECT id, CONCAT(first_name, " ", last_name) AS name, role_id, manager_id FROM employees',
    (err, res) => {
      if (err) console.error(err);
      else {
        // console.table(res);
        const employees = res;
        inquirer
          .prompt({
            type: "list",
            name: "employeeName",
            message: "Choose an employee to update",
            choices: employees.map(({ name }) => name),
          })
          .then((answers) => {
            updateEmployee(employees, answers.employeeName);
          });
      }
    }
  );
}

// this is the second part of Update an Employee, it takes the employee list and selected employee and asks the user what they'd like to update. if they say either of the employee's names then the function simply calls an update query on the new name they've provided. If they choose manager, it uses the employees list as a list inquiry and updates the user based on the selected employee. Finally if they choose role it will call the role table and ask them to select a role, and update based on the role provided.
function updateEmployee(employees, employeeName) {
  const targetEmployeeID = employees.find(
    (obj) => obj.name === employeeName
  ).id;
  inquirer
    .prompt([
      {
        type: "list",
        name: "updateOption",
        message: "what do you want to update",
        choices: ["First Name", "Last Name", "Title", "Manager"],
      },
    ])
    .then((answer) => { //in future I might move all of these into helper functions but that seemed to move to be too clunky in the other direction.
      switch (answer.updateOption) {
        case "First Name":
          inquirer
            .prompt({
              type: "input",
              name: "changeTo",
              message: "What would you like to change it to",
            })
            .then((answers) => {
              db.query(
                "UPDATE employees SET first_name = ? WHERE id = ?",
                [answers.changeTo, targetEmployeeID],
                (err, res) => {
                  err ? console.error(err) : viewEmployees();
                }
              );
            });
          break;

        case "Last Name":
          inquirer
            .prompt({
              type: "input",
              name: "changeTo",
              message: "What would you like to change it to",
            })
            .then((answers) => {
              db.query(
                "UPDATE employees SET last_name = ? WHERE id = ?",
                [answers.changeTo, targetEmployeeID],
                (err, res) => {
                  err ? console.error(err) : viewEmployees();
                }
              );
            })
            .catch((err) => {
              console.error(err);
            });
          break;

        case "Title":
        //running a mysql2 query and running inquirer inside of it was the most elegant way I could find to do this
          db.query("SELECT id, title FROM roles", (err, res) => {
            if (err) console.error(err);
            else {
              const roles = res;
              inquirer
                .prompt({
                  type: "list",
                  name: "newRole",
                  message: "What should the new role be for this user?",
                  choices: roles.map(({ title }) => title),
                })
                .then((answer) => {
                  const newRole = roles.find(
                    (obj) => obj.title === answer.newRole
                  );
                  // this code will update the employee record with id ${targetEmployeeID} to show a role with an id of ${newRole.id}
                  db.query(
                    "UPDATE employees SET role_id = ? WHERE id = ?",
                    [newRole.id, targetEmployeeID],
                    (err, res) => {
                      err ? console.error(err) : viewEmployees();
                    }
                  );
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          });
          break;

        case "Manager":
          employees.push({
            id: null,
            name: "None",
            role_id: null,
            manager_id: null,
          });
          inquirer
            .prompt({
              type: "list",
              name: "managerName",
              message: "Who should be the manager?",
              choices: employees.map(({ name }) => name),
            })
            .then((answers) => {
              // console.log(employees);
              // console.log('manager target ' + answers.managerName)
              const manager = employees.find(
                (obj) => obj.name === answers.managerName
              );
              // console.log(`This query is going to change the manager_id of ${employeeName}, id ${targetEmployeeID} to ${manager.id}`)
              db.query(
                "UPDATE employees SET manager_id = ? WHERE id = ?",
                [manager.id, targetEmployeeID],
                (err, res) => {
                  err ? console.error(err) : viewEmployees();
                }
              );
            })
            .catch((err) => {
              console.error(err);
            });
          break;
        default:
          break;
      }
    });
}

//this simply asks the user what the name, salary, and department(list) of the new role are and adds it to the database
function addRole() {
  db.query("SELECT * FROM departments", (err, res) => {
    if (err) console.error(err);
    else {
      const departments = res;
      db.query("SELECT title, salary FROM roles", (err, res) => {
        if (err) console.error(err);
        else {
          // console.log(res);
          const roles = res.map(({ title }) => title);
          // console.log(roles);
          inquirer
            .prompt([
              {
                type: "input",
                name: "title",
                message: "What is the title of the new role?",
                validate: function (value) { //this checks if the user has entered a role that already exists
                  if (roles.includes(value))
                    return "That title seems to already be taken, please enter another";
                  return true;
                },
              },
              {
                type: "input",
                name: "salary",
                message: "What should the salary of the new role be",
                validate: function (value) {
                  const salary = parseInt(value);
                  if (isNaN(salary) || salary <= 795000)
                  //probably themost controversial part of this, my validate function assumes the user is adding an NFL player and thus makes sure the salary is above NFL base salary
                    return "Please enter a number greater than the NFL base salary, $795,000";
                  else return true;
                },
              },
              {
                type: "list",
                name: "department",
                message: "what department should this new role be under",
                choices: departments.map( //this little snippet of code is used a ton of places, it basically takes the list of objects that SQL queries return and puts them into arrays that the list inquiries need
                  ({ department_name }) => department_name
                ),
              },
            ])
            .then((answers) => {
              const department_id = departments.find( //this is the other overused snippet of code, it basically just returns he object in the list that has the same name or whatever other variable so I can take the list and the name selected by the user to find the same manager's id.
                (obj) => obj.department_name === answers.department
              ).id;
              const newRoleObj = {
                title: answers.title,
                department_id,
                salary: answers.salary,
              };
              // I used the insert into set syntax because I thought it was more readable for the JS portion
              db.query("INSERT INTO roles SET ?", newRoleObj, (err, res) => {
                err ? console.error(err) : viewRoles();
              });
            })
            .catch((err) => {
              console.error(err);
            });
        }
      });
    }
  });
}

//Adds a department, the only variable it needs to ask the user is the name
function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      message: "What is the name of this new department",
      name: "name",
    })
    .then((answer) => {
      const newDepartment = {
        department_name: answer.name,
      };
      db.query("INSERT INTO departments SET ?", newDepartment, (err, res) => {
        err ? console.error(err) : viewDepartments();
      });
    })
    .catch((err) => {
      console.error(err);
    });
}

// similar to viewEmployees, but ordering by managers
function viewEmployeesByManager() {
  db.query(
    `SELECT IFNULL(CONCAT(man.first_name, " ", man.last_name), "No manager on file") as Manager, CONCAT(emp.first_name, " ", emp.last_name) AS Employee, title, department_name as department, salary
    FROM employees AS emp
    LEFT JOIN employees AS man
    ON emp.manager_id = man.id
    LEFT JOIN roles
    ON roles.id = emp.role_id
    LEFT JOIN departments
    ON roles.department_id = departments.id
    ORDER BY Manager;`,
    (err, res) => {
      err ? console.error(err) : console.table(res), start();
    }
  );
}

//this one is also the same, but ordering by department
function viewEmployeesByDepartment() {
    db.query(
      `SELECT department_name as department, CONCAT(emp.first_name, " ", emp.last_name) AS Employee, title, salary, IFNULL(CONCAT(man.first_name, " ", man.last_name), "") as Manager
      FROM employees AS emp
      LEFT JOIN employees AS man
      ON emp.manager_id = man.id
      LEFT JOIN roles
      ON roles.id = emp.role_id
      LEFT JOIN departments
      ON roles.department_id = departments.id
      ORDER BY department, salary;`,
      (err, res) => {
        err ? console.error(err) : console.table(res), start();
      }
    );
}

start();
