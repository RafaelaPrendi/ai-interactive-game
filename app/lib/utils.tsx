// utils/sendRecording.ts
export const sendRecording = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", new File([blob], "recording.wav"));

    try {
        const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error(res.statusText);

        const data = await res.json();
        return data.text; // returned transcript
    } catch (err) {
        console.error("Error sending recording:", err);
        return null;
    }
};