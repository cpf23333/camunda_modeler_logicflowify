let reader = new FileReader();
/**读取文本文件内容 */
export let readFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      reader.onload = null;
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        console.error(reader.result);
        reject("该文件不是文本");
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
export let downloadByBlob = ({
  blob,
  filename,
}: {
  blob: Blob;
  filename: string;
}) => {
  let url = URL.createObjectURL(blob);
  downloadByLink({ link: url, filename });
  URL.revokeObjectURL(url);
};
export let downloadByLink = ({
  link,
  filename,
}: {
  link: string;
  filename: string;
}) => {
  let a = document.createElement("a");
  a.style.display = "none";
  a.style.visibility = "hidden";
  a.download = filename;
  a.href = link;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
export let downloadTxt = (txt: string, filename: string) => {
  let blob = new Blob([txt], { type: "text/plan" });
  downloadByBlob({ blob, filename });
};
