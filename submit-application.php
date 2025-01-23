<?php
// Set the email address where applications should be sent
$recipient_email = "maecity@aol.com"; // Replace with your email
$upload_dir = "uploads/"; // Directory to store uploaded resumes
$allowed_extensions = ['pdf', 'doc', 'docx']; // Allowed file types
$max_file_size = 2 * 1024 * 1024; // Max file size: 2MB

// Check if form data is submitted
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Sanitize form inputs
    $name = htmlspecialchars(trim($_POST['name']));
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $phone = htmlspecialchars(trim($_POST['phone']));
    $position = htmlspecialchars(trim($_POST['position']));
    $experience = htmlspecialchars(trim($_POST['experience']));

    // Validate inputs
    if (!$name || !$email || !$phone || !$position || !$experience) {
        http_response_code(400);
        echo "Please fill out all required fields.";
        exit;
    }

    // Handle file upload
    if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
        $file_name = $_FILES['resume']['name'];
        $file_tmp = $_FILES['resume']['tmp_name'];
        $file_size = $_FILES['resume']['size'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        // Validate file type and size
        if (!in_array($file_ext, $allowed_extensions)) {
            http_response_code(400);
            echo "Invalid file type. Only PDF, DOC, and DOCX files are allowed.";
            exit;
        }
        if ($file_size > $max_file_size) {
            http_response_code(400);
            echo "File size exceeds the 2MB limit.";
            exit;
        }

        // Save the file to the uploads directory
        $unique_file_name = uniqid("resume_", true) . "." . $file_ext;
        $destination = $upload_dir . $unique_file_name;

        if (!move_uploaded_file($file_tmp, $destination)) {
            http_response_code(500);
            echo "Failed to upload the resume. Please try again.";
            exit;
        }
    } else {
        http_response_code(400);
        echo "Please upload your resume.";
        exit;
    }

    // Prepare email content
    $subject = "Job Application - $position";
    $message = "
        A new job application has been submitted.\n\n
        Name: $name\n
        Email: $email\n
        Phone: $phone\n
        Position: $position\n
        Experience:\n$experience\n\n
        Resume: " . $_SERVER['HTTP_HOST'] . "/" . $destination . "\n
    ";
    $headers = "From: $email";

    // Send the email
    if (mail($recipient_email, $subject, $message, $headers)) {
        http_response_code(200);
        echo "Your application has been submitted successfully!";
    } else {
        http_response_code(500);
        echo "Failed to send your application. Please try again later.";
    }
} else {
    http_response_code(405);
    echo "Invalid request method.";
    exit;
}
?>
