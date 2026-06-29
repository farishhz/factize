import os
import sys

def main():
    try:
        from PIL import Image
    except ImportError:
        print("Pillow library not found. Installing now...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
        from PIL import Image

    logo_path = os.path.join("public", "logo1.png")
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} does not exist.")
        return

    img = Image.open(logo_path)
    
    # Target sizes and output filenames
    targets = [
        {"size": (192, 192), "filename": "icon-192.png"},
        {"size": (512, 512), "filename": "icon-512.png"},
        {"size": (180, 180), "filename": "apple-touch-icon.png"},
        {"size": (512, 512), "filename": "maskable-icon.png"}
    ]

    for target in targets:
        out_path = os.path.join("public", target["filename"])
        # Ensure it has high quality antialiasing/resampling (LANCZOS)
        resized = img.resize(target["size"], Image.Resampling.LANCZOS)
        resized.save(out_path, "PNG")
        print(f"Generated {out_path} at size {target['size']}")

    print("PWA icons generated successfully!")

if __name__ == "__main__":
    main()
