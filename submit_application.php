<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Application Form</title>
</head>
<body>
    <form action="submit_application.php" method="POST" 
enctype="multipart/form-data">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required><br>
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br>
        
        <label for="phone">Phone:</label>
        <input type="tel" id="phone" name="phone" required><br>
        
        <label for="position">Position:</label>
        <input type="text" id="position" name="position" required><br>
        
        <label for="experience">Experience:</label>
        <textarea id="experience" name="experience" 
required></textarea><br>
        
        <label for="resume">Resume:</label>
        <input type="file" id="resume" name="resume" 
accept=".pdf,.doc,.docx" required><br>
        
        <button type="submit">Submit Application</button>
    </form>
</body>
</html>

