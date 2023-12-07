CREATE TABLE Subject (
    id SERIAL PRIMARY KEY,
    age INTEGER,
    gender INTEGER,
    height REAL,
    weight REAL
);

CREATE TABLE Walk (
    id SERIAL PRIMARY KEY,
    track INTEGER,
    device_position INTEGER,
    walk_type INTEGER,
    phone_model VARCHAR(255),
    subject_id INTEGER,
    FOREIGN KEY (subject_id) REFERENCES Subject(id)
);

CREATE TABLE Accelerometer (
    id SERIAL PRIMARY KEY,
    avg_sample_rate REAL,
    avg_delay REAL,
    sensor_model VARCHAR(255),
    accl_net_avg REAL,
    accl_net_dev REAL,
    accl_x_avg REAL,
    accl_y_avg REAL,
    accl_z_avg REAL,
    accl_x_dev REAL,
    accl_y_dev REAL,
    accl_z_dev REAL,
    walk_id INTEGER,
    FOREIGN KEY (walk_id) REFERENCES Walk(id)

);

CREATE TABLE Gyroscope (
    id SERIAL PRIMARY KEY,
    avg_sample_rate REAL,
    avg_delay REAL,
    sensor_model VARCHAR(255),
    gyro_net_avg REAL,
    gyro_net_dev REAL,
    gyro_x_avg REAL,
    gyro_y_avg REAL,
    gyro_z_avg REAL,
    gyro_x_dev REAL,
    gyro_y_dev REAL,
    gyro_z_dev REAL,
    walk_id INTEGER,
    FOREIGN KEY (walk_id) REFERENCES Walk(id)
);

CREATE TABLE Accelerometer_data (
    id SERIAL PRIMARY KEY,
    timestamp REAL,
    accl_x REAL,
    accl_y REAL,
    accl_z REAL,
    accelerometer_id INTEGER,
    FOREIGN KEY (accelerometer_id) REFERENCES Accelerometer(id)
);

CREATE TABLE Gyroscope_data (
    id SERIAL PRIMARY KEY,
    timestamp REAL,
    gyro_x REAL,
    gyro_y REAL,
    gyro_z REAL,
    gyroscope_id INTEGER,
    FOREIGN KEY (gyroscope_id) REFERENCES Gyroscope(id)
);

SELECT * FROM Subject;

INSERT INTO subject VALUES ($1, $2, $3) RETURNING *;