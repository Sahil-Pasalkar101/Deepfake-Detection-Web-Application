
const URL = "./my_model/";

let model, maxPredictions;
let uploadedImage = null;

// Initialize the model and setup event listeners
async function init() {
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "Loading model...";

    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // Load the model and metadata
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        labelContainer.innerHTML = "Model Loaded! Please upload an image.";

        // Setup file input listener now that the model is ready
        document.getElementById('imageUpload').addEventListener('change', handleImage, false);
    } catch (error) {
        console.error("Error loading model:", error);
        labelContainer.innerHTML = "Failed to load model. Verify your URL path.";
    }
}

// Handle image upload and display it on a canvas element
function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function() {
            // Setup canvas configuration
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            // Draw uploaded image resized to match model requirements
            ctx.drawImage(img, 0, 0, 200, 200);
            
            // Update container content
            const container = document.getElementById('image-container');
            container.innerHTML = ''; 
            container.appendChild(canvas);
            
            // Reference canvas context for prediction step
            uploadedImage = canvas;
            predict();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

// Run the image canvas through the model classifier
async function predict() {
    if (!model || !uploadedImage) return;

    const prediction = await model.predict(uploadedImage);
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ''; // Clear prior evaluation text

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probabilityPercentage = Math.round(prediction[i].probability * 100);

        // Construct HTML markup safely for the evaluation dashboard
        const classPrediction = `
            <div class="prediction-item">
                <span>${className}:</span>
                <span>${probabilityPercentage}%</span>
            </div>`;
        
        labelContainer.innerHTML += classPrediction;
    }
}