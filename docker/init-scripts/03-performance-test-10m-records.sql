-- Script test hiệu suất với 10 triệu records
-- Tạo bảng test riêng để không ảnh hưởng đến dữ liệu thực
-- Tạo bảng test_performance
CREATE TABLE IF NOT EXISTS test_performance (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  random_data JSONB DEFAULT '{}'
);
-- Tạo index để tối ưu
CREATE INDEX IF NOT EXISTS idx_test_perf_username ON test_performance(username);
CREATE INDEX IF NOT EXISTS idx_test_perf_email ON test_performance(email);
CREATE INDEX IF NOT EXISTS idx_test_perf_created_at ON test_performance(created_at);
-- Function để generate random data
CREATE OR REPLACE FUNCTION generate_random_user_data() RETURNS TABLE(
    username VARCHAR(50),
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    random_data JSONB
  ) AS $$
DECLARE first_names TEXT [] := ARRAY ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emma', 'Alex', 'Maria', 'Chris', 'Anna', 'Mark', 'Julia', 'Paul', 'Kate', 'Steve', 'Laura', 'Dan', 'Sofia'];
last_names TEXT [] := ARRAY ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
domains TEXT [] := ARRAY ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'test.com', 'example.com', 'demo.com', 'sample.com', 'mock.com', 'fake.com'];
i INTEGER;
random_first TEXT;
random_last TEXT;
random_domain TEXT;
random_username TEXT;
random_email TEXT;
random_phone TEXT;
random_json JSONB;
BEGIN FOR i IN 1..10000000 LOOP -- Generate random data
random_first := first_names [1 + floor(random() * array_length(first_names, 1))];
random_last := last_names [1 + floor(random() * array_length(last_names, 1))];
random_domain := domains [1 + floor(random() * array_length(domains, 1))];
random_username := random_first || '_' || random_last || '_' || i;
random_email := random_first || '.' || random_last || i || '@' || random_domain;
random_phone := '+84' || (100000000 + floor(random() * 900000000))::TEXT;
random_json := jsonb_build_object(
  'age',
  18 + floor(random() * 60),
  'city',
  'City_' || (1 + floor(random() * 100)),
  'score',
  floor(random() * 1000),
  'active',
  (random() > 0.5),
  'tags',
  jsonb_build_array(
    'tag_' || (1 + floor(random() * 10)),
    'category_' || (1 + floor(random() * 5))
  )
);
username := random_username;
email := random_email;
first_name := random_first;
last_name := random_last;
phone := random_phone;
random_data := random_json;
RETURN NEXT;
END LOOP;
END;
$$ LANGUAGE plpgsql;
-- Function để insert batch data
CREATE OR REPLACE FUNCTION insert_batch_data(batch_size INTEGER) RETURNS VOID AS $$
DECLARE i INTEGER;
start_time TIMESTAMP;
end_time TIMESTAMP;
duration INTERVAL;
BEGIN start_time := clock_timestamp();
-- Insert data in batches
FOR i IN 1..10000000 BY batch_size LOOP
INSERT INTO test_performance (
    username,
    email,
    first_name,
    last_name,
    phone,
    random_data
  )
SELECT 'user_' || (i + j),
  'user' || (i + j) || '@test.com',
  'FirstName_' || (i + j),
  'LastName_' || (i + j),
  '+84' || (100000000 + (i + j) % 900000000),
  jsonb_build_object(
    'age',
    18 + ((i + j) % 60),
    'city',
    'City_' || ((i + j) % 100),
    'score',
    (i + j) % 1000,
    'active',
    ((i + j) % 2) = 0,
    'batch_id',
    i
  )
FROM generate_series(0, LEAST(batch_size - 1, 10000000 - i)) AS j;
-- Log progress every 100k records
IF i % 100000 = 0 THEN RAISE NOTICE 'Inserted % records',
i;
END IF;
END LOOP;
end_time := clock_timestamp();
duration := end_time - start_time;
RAISE NOTICE 'Total time: %',
duration;
RAISE NOTICE 'Records per second: %',
10000000 / EXTRACT(
  EPOCH
  FROM duration
);
END;
$$ LANGUAGE plpgsql;