import { Canvg } from "canvg";

export const svgToDataUri = async (svgString: string): Promise<string | null> => {
  try {
    // Validate SVG input
    if (!svgString || svgString.trim().length === 0) {
      console.error("Invalid SVG input");
      return null;
    }

    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = 24; // Set reasonable dimensions for flag icons
    canvas.height = 24;
    
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Could not get canvas context");
      return null;
    }

    try {
      const v = Canvg.fromString(context, svgString.trim());
      
      // Add timeout to prevent infinite rendering
      const renderPromise = v.render();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("SVG rendering timed out")), 5000);
      });

      await Promise.race([renderPromise, timeoutPromise]);
      
      const dataUri = canvas.toDataURL("image/png", 0.8); // Add quality parameter
      return dataUri || null;
    } catch (renderError) {
      console.error("Error during SVG rendering:", renderError);
      return null;
    }
  } catch (error) {
    console.error("Error in svgToDataUri:", error);
    return null;
  }
};