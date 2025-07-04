import matplotlib
matplotlib.use('Agg')
import os
import datetime
import numpy as np
import torch
from PIL import Image

def save_reconstructed_image(image, final_image):
    try:
        results_dir = "app/results"
        os.makedirs(results_dir, exist_ok=True)
        
        if isinstance(final_image, torch.Tensor):
            final_image = final_image.detach().cpu().numpy()
        
        if final_image.ndim == 2 and (final_image.shape[1] == 1 or final_image.shape[0] == 1):
            final_image = final_image.flatten()
        if final_image.ndim == 1:
            if image.size == 60:
                final_image = final_image.reshape(60, 60)
            elif image.size == 30:
                final_image = final_image.reshape(30, 30)
            else:
                print(f"ERROR: Unknown image size: {image.size}", flush=True)
                return None
        elif final_image.ndim > 2:
            final_image = final_image.squeeze()
            if final_image.ndim > 2:
                final_image = final_image[:, :, 0] if final_image.shape[2] > 0 else final_image[:, :]
        
        final_image = final_image.T
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        grayscale_filename = image.get_image_filename()
        grayscale_filepath = os.path.join(results_dir, grayscale_filename)
        
        if final_image.max() != final_image.min():
            normalized_image = ((final_image - final_image.min()) / 
                              (final_image.max() - final_image.min()) * 255).astype(np.uint8)
        else:
            normalized_image = np.zeros_like(final_image, dtype=np.uint8)
        
        pil_image = Image.fromarray(normalized_image, mode='L')
        pil_image.save(grayscale_filepath)
        print(f"Grayscale image saved: {grayscale_filepath}", flush=True)
        return grayscale_filepath
        
    except Exception as e:
        print(f"ERROR SAVING IMAGE: {e}", flush=True)
        return None 
