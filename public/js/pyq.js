// This script handles the download button functionality for question papers
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.download-btn').forEach((button) => {
    button.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      console.log('Download clicked for ID:', id); // For debugging

      try {
        const response = await fetch(`/pyq/download/${id}`);
        if (response.ok) {
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'question-paper.pdf'; 
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error('Failed to download file:', response.statusText);
          alert("Download failed.");
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        alert("Error downloading file.");
      }
    });
  });
});
