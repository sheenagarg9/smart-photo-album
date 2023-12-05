// script.js
function searchPhotos() {
    var query = document.getElementById('search-query').value;
    fetch('/search?query=' + query)
        .then(response => response.json())
        .then(data => displayResults(data))
        .catch(error => console.error('Error:', error));
}

function displayResults(data) {
    var resultsSection = document.getElementById('results-section');
    resultsSection.innerHTML = ''; // Clear previous results
    data.photos.forEach(photo => {
        var img = document.createElement('img');
        img.src = photo.url;
        resultsSection.appendChild(img);
    });
}

function uploadPhoto() {
    var fileInput = document.getElementById('photo-upload');
    var customLabels = document.getElementById('custom-labels').value;
    var file = fileInput.files[0];
    var formData = new FormData();
    formData.append('photo', file);

    fetch('/photos', {
        method: 'PUT',
        headers: {
            'x-amz-meta-customLabels': customLabels
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
}
