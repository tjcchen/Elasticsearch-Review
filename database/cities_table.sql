-- Simple Cities Table for Neon PostgreSQL Database
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    population INTEGER,
    description TEXT
);

-- Sample data for Elasticsearch testing
INSERT INTO cities (name, state, population, description) VALUES
('New York City', 'New York', 8336817, 'The largest city in the US, known for Times Square, Central Park, and the Statue of Liberty.'),
('Los Angeles', 'California', 3898747, 'Entertainment capital of the world, home to Hollywood and beautiful beaches.'),
('Chicago', 'Illinois', 2693976, 'The Windy City, famous for deep-dish pizza, architecture, and blues music.'),
('Houston', 'Texas', 2304580, 'Space City, home to NASA and a major center for oil and gas industry.'),
('Phoenix', 'Arizona', 1608139, 'Desert metropolis with year-round sunshine and stunning desert landscapes.'),
('Philadelphia', 'Pennsylvania', 1584064, 'The City of Brotherly Love, birthplace of American independence.'),
('San Antonio', 'Texas', 1547253, 'Historic city famous for the Alamo and vibrant River Walk.'),
('San Diego', 'California', 1386932, 'Americas Finest City with perfect weather, beaches, and the famous zoo.'),
('Dallas', 'Texas', 1304379, 'Big D, a major business hub known for cowboys and modern skyline.'),
('Austin', 'Texas', 978908, 'Keep Austin Weird - the live music capital with a thriving tech scene.'),
('San Francisco', 'California', 873965, 'The Golden City, home to the Golden Gate Bridge and Silicon Valley tech culture.'),
('Seattle', 'Washington', 737015, 'Emerald City known for coffee culture, tech companies, and the Space Needle.'),
('Denver', 'Colorado', 715522, 'The Mile High City, gateway to the Rocky Mountains and outdoor adventures.'),
('Boston', 'Massachusetts', 695506, 'Beantown, rich in American history with world-class universities.'),
('Miami', 'Florida', 442241, 'Magic City with beautiful beaches, vibrant nightlife, and Art Deco architecture.'),
('Atlanta', 'Georgia', 498715, 'The Big Peach, major transportation hub and center of the civil rights movement.'),
('Las Vegas', 'Nevada', 651319, 'Sin City, entertainment capital with casinos, shows, and desert adventures.'),
('Portland', 'Oregon', 652503, 'Keep Portland Weird - known for food trucks, craft beer, and eco-friendly culture.'),
('Nashville', 'Tennessee', 689447, 'Music City, home of country music and the Grand Ole Opry.'),
('Detroit', 'Michigan', 639111, 'Motor City, birthplace of the American automotive industry and Motown music.');
