INSERT INTO departments (department_name)
VALUES
("Offense"),
("Defense"),
("Special Teams"),
("Coaching");

INSERT INTO roles (title, department_id, salary)
VALUES
("Quarterback", 1, 40000000),
("Wide Receiver", 1, 35000000),
("Linebacker", 2, 15000000),
("Cornerback", 2, 10000000),
("Punter", 3, 5000000),
("Long Snapper", 3, 3000000),
("Head Coach", 4, 10000000),
("Offensive Coordinator", 4, 5000000);

INSERT INTO employees (first_name, last_name, role_id)
VALUES
("Jared", "Goff", 1),
("Alex", "Anzalone", 3),
("Jack", "Fox", 5),
("Dan", "Campbell", 7);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
("AmonRa", "StBrown", 2, 1),
("Brian", "Branch", 4, 2),
("Scott", "Daly", 6, 3),
("Ben", "Johnson", 8, 4);




