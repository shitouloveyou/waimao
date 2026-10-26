// Basic file signature validation; this is not antivirus scanning.
export function matchesFileType(data: Buffer, type: string): boolean {
  if (type === "image/jpeg") return data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255;
  if (type === "image/png") return data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (type === "image/webp") return data.length >= 12 && data.toString("ascii",0,4) === "RIFF" && data.toString("ascii",8,12) === "WEBP";
  if (type === "application/pdf") return data.toString("ascii",0,5) === "%PDF-";
  if (type === "video/mp4") return data.length >= 12 && data.toString("ascii",4,8) === "ftyp";
  if (type === "video/webm") return data.subarray(0,4).equals(Buffer.from([26,69,223,163]));
  return false;
}
