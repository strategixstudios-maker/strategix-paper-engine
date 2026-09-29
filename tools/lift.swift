// lift.swift — κόβει το φόντο από φωτογραφία (macOS Vision, «Lift subject»· όπως στο Photos) → PNG με alpha, ίδιο μέγεθος
// Το χρησιμοποιεί το photos.js (το κάνει compile μία φορά σε ~/.cache/strategix/lift). Χρειάζεται macOS 14+.
import Vision
import CoreImage
let args = CommandLine.arguments
guard args.count == 3, let ci = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else { print("usage: lift <in.jpg> <out.png>"); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
guard let r = req.results?.first else { print("lift: δεν βρέθηκε θέμα στη φωτογραφία"); exit(2) }
let buf = try r.generateMaskedImage(ofInstances: r.allInstances, from: h, croppedToInstancesExtent: false)
try CIContext().writePNGRepresentation(of: CIImage(cvPixelBuffer: buf), to: URL(fileURLWithPath: args[2]), format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
