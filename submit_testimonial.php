<?php
$servername = "localhost"; // Change this if needed
$username = "root"; // Database username
$password = ""; // Database password
$dbname = "delanes_nails"; // Your database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$name = $_POST['name'];
$testimonial = $_POST['testimonial'];
$status = "pending"; // New submissions are pending approval

$sql = "INSERT INTO testimonials (name, testimonial, status) VALUES 
('$name', '$testimonial', '$status')";

if ($conn->query($sql) === TRUE) {
    echo "Testimonial submitted successfully! It will be reviewed before 
appearing on the site.";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>

