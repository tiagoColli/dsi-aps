from flask_sqlalchemy import SQLAlchemy
import numpy as np
from PIL import Image
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Fetch the image from the database
retrieved_image = ImageModel.query.filter_by(name="example_image").first()
image_bytes = retrieved_image.image_data
image_shape = tuple(map(int, retrieved_image.image_shape.split(",")))

# Reconstruct the NumPy matrix
image_matrix = np.frombuffer(image_bytes, dtype=np.uint8).reshape(image_shape)

# Convert to PIL Image
if len(image_shape) == 2:
    image = Image.fromarray(image_matrix, mode='L')
elif len(image_shape) == 3:
    image = Image.fromarray(image_matrix, mode='RGB')
else:
    raise ValueError("Unsupported image shape")

# Save the image temporarily
image.save("temp_image.png")

# Generate a PDF report
pdf_path = "image_report.pdf"
c = canvas.Canvas(pdf_path, pagesize=letter)
c.drawString(100, 750, "Reconstructed Image Report")
c.drawImage("temp_image.png", 100, 500, width=200, height=200)
c.save()
