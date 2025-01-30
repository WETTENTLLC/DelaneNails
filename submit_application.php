<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $full_name = htmlspecialchars($_POST['full_name']);
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $phone = htmlspecialchars($_POST['phone']);
    $position = htmlspecialchars($_POST['position']);
    $additional_info = htmlspecialchars($_POST['additional_info']);

    if (!$email) {
        die("Invalid email address.");
    }

    // File Upload Handling
    $upload_dir = "uploads/";
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $resume = $_FILES['resume'];
    $resume_path = $upload_dir . basename($resume["name"]);
    $allowed_extensions = ["pdf", "docx"];

    $file_extension = pathinfo($resume_path, PATHINFO_EXTENSION);
    if (!in_array(strtolower($file_extension), $allowed_extensions)) {
        die("Only PDF and DOCX files are allowed.");
    }

    if (move_uploaded_file($resume["tmp_name"], $resume_path)) {
        // Email Notification
        $to = "your-email@example.com"; // Replace with your email
        $subject = "New Job Application from $full_name";
        $message = "Name: $full_name\nEmail: $email\nPhone: 
$phone\nPosition: $position\nAdditional Info: $additional_info\nResume: 
$resume_path";
        $headers = "From: noreply@delanesnails.com";

        mail($to, $subject, $message, $headers);

        echo "Application submitted successfully!";
    } else {
        echo "Error uploading file.";
    }
}
?>

