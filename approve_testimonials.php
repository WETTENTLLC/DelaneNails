<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "delanes_nails";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Approve testimonial when admin clicks approve
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['approve'])) {
    $id = $_POST['id'];
    $conn->query("UPDATE testimonials SET status='approved' WHERE 
id=$id");
}

// Fetch pending testimonials
$result = $conn->query("SELECT * FROM testimonials WHERE 
status='pending'");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approve Testimonials</title>
</head>
<body>
    <h2>Pending Testimonials</h2>
    <?php while ($row = $result->fetch_assoc()) { ?>
        <div>
            <p><strong><?php echo $row['name']; ?>:</strong> <?php echo 
$row['testimonial']; ?></p>
            <form method="POST">
                <input type="hidden" name="id" value="<?php echo 
$row['id']; ?>">
                <button type="submit" name="approve">Approve</button>
            </form>
        </div>
    <?php } ?>
</body>
</html>

<?php $conn->close(); ?>

