<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "delanes_nails";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch only approved testimonials
$result = $conn->query("SELECT * FROM testimonials WHERE 
status='approved'");

while ($row = $result->fetch_assoc()) {
    echo "<div class='testimonial frame'>";
    echo "<p>\"" . $row['testimonial'] . "\"</p>";
    echo "<span>- " . $row['name'] . "</span>";
    echo "</div>";
}

$conn->close();
?>

