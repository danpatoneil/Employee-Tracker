const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'employees_db'
    },
    console.log('connected')
)

function start(){
inquirer.prompt(
    {
        type: 'list',
        name: 'opening',
        message: 'What do you want',
        choices: [
            'Veiw All Employees',
            'Add Employee',
            'Update Employee Role',
            'Update Employee Manager',
            'View All Roles',
            'Add Role',
            'View All Departments',
            'Add Department',
            'Quit'
        ]
    }
)
.then((answers) => {
    console.log(answers.opening);
    let userChoice = answers.opening;
    switch (userChoice) {
        case 'Veiw All Employees':
          viewEmployees();
            break;

        case 'Add Employee':
            addEmployee();
            break;

        case 'Update Employee Role':
            updateEmployeeRole();
            break;

        case 'Update Employee Manager':
            updateEmployeeManager();
            break;

        case 'View All Roles':
            viewRoles();
            break;

        case 'Add Role':
            addRole();
            break;

        case 'View All Departments':
            viewDepartments();
            break;

        case 'Add Departments':
            addDepartment();
            break;

        default:
            break;
    }
})
}

function viewEmployees(){
    //select emp.first_name as "First Name", emp.last_name as "Last Name", concat(man.first_name, " ", man.last_name) as Manager FROM employees emp, employees man
    // where man.id = emp.manager_id;
    //
    db.query(`SELECT emp.id, emp.first_name as "First Name", emp.last_name as "Last Name", title, department_name as department, salary, IFNULL(CONCAT(man.first_name, " ", man.last_name), "") as Manager
        FROM employees AS emp
        LEFT JOIN employees AS man
        ON emp.manager_id = man.id
        LEFT JOIN roles
        ON roles.id = emp.role_id
        LEFT JOIN departments
        ON roles.department_id = departments.id
        ORDER BY emp.id ASC`, (err, res) => {
        err ? console.error(err) : console.table(res), start();
    });

}

function viewDepartments(){
    //first_name, last_name, title, salary
    db.query('SELECT id, department_name AS department FROM departments ORDER BY department_name ASC', (err, res) => {
        err ? console.error(err) : console.table(res), start();
    });

}

function viewRoles(){
    //first_name, last_name, title, salary
    db.query('SELECT roles.id, title, salary, department_name as department FROM roles LEFT JOIN departments ON roles.department_id = departments.id ORDER BY salary DESC', (err, res) => {
        err ? console.error(err) : console.table(res), start();
    });

}
function addEmployee(){
    inquirer.prompt([
    {
      type: 'input',
      message: ''
    }
  ])
}
function updateEmployee(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'updateOption',
            message: 'what do you want to update',
            choices: [
                'First Name',
                'Last Name',
                'Role',
                'Manager'
            ]
        }
    ])
    .then((answer) => {
        console.log(answer);
        switch (answer) {
            case 'First Name':
                db.query('UPDATE employees SET first_name TO ?', answer, (err, res) => {
                    err ? console.error(err) : viewEmployees();
                })
                break;

            default:
                break;
        }
    })
}
start()
