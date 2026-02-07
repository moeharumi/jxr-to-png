'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Loader2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [logMessage, setLogMessage] = useState('初始化引擎中...');

  const ffmpegRef = useRef<FFmpeg | null>(null);

  const load = async () => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      // console.log(message);
      // 只显示关键信息或最后一条日志
      if (message.includes('frame=')) {
        setLogMessage('正在处理...');
      }
    });

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setReady(true);
      setLogMessage('引擎就绪 (≧∇≦)ﾉ');
    } catch (e: any) {
      console.error(e);
      setError('无法加载转换引擎，请检查网络连接 (需要访问 unpkg.com) 或使用最新版 Chrome/Edge 浏览器。');
      setLogMessage('加载失败');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setConvertedUrl(null);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file || !ready) return;

    setIsConverting(true);
    setError(null);
    setLogMessage('开始读取文件...');

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;

    // 使用简单的文件名以避免特殊字符问题
    const inputName = 'input.jxr';
    const outputName = 'output.png';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setLogMessage('正在转码 (ffmpeg)...');
      // 执行转换
      await ffmpeg.exec(['-i', inputName, outputName]);

      setLogMessage('生成 PNG...');
      const data = await ffmpeg.readFile(outputName);

      const url = URL.createObjectURL(
        new Blob([data as any], { type: 'image/png' })
      );

      setConvertedUrl(url);
      setLogMessage('完成！✨');
    } catch (err: any) {
      console.error(err);
      setError('转换过程中发生错误: ' + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-pink-50 text-slate-800 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border-4 border-pink-200">
        <h1 className="text-3xl font-bold text-center mb-2 text-pink-500 flex items-center justify-center gap-2">
          <ImageIcon className="w-8 h-8" />
          JXR 转 PNG
        </h1>

        <div className="text-center mb-6 space-y-1">
          <p className="text-lg font-bold text-pink-400">✨ 华得府专用转换器 ✨</p>
          <p className="text-xs text-pink-300 italic">应猴哥要求开发 🫡</p>
        </div>

        <p className="text-center text-pink-300 text-sm mb-8 font-medium">
          Client-side FFmpeg Powered
        </p>

        {!ready && !error && (
          <div className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-xl mb-6 text-yellow-600">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p>{logMessage}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="border-2 border-dashed border-pink-300 rounded-xl p-8 text-center hover:bg-pink-50 transition-colors cursor-pointer relative group">
            <input
              type="file"
              accept=".jxr,image/jxr,image/vnd.ms-photo"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={!ready}
            />
            <div className="flex flex-col items-center gap-2 text-pink-400 group-hover:text-pink-500 transition-colors">
              <Upload className="w-10 h-10" />
              <p className="font-medium">
                {file ? file.name : "点击或拖拽 JXR 文件到这里"}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm text-center flex flex-col items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={!file || isConverting || !ready}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {logMessage}
              </>
            ) : (
              "开始转换 ✨"
            )}
          </button>

          {convertedUrl && (
            <div className="animate-fade-in text-center space-y-4 pt-4 border-t border-pink-100">
              <div className="bg-green-50 text-green-600 p-3 rounded-lg font-medium flex items-center justify-center gap-2">
                <span>转换成功！(≧∇≦)ﾉ</span>
              </div>

              {/* Preview Image */}
              <div className="rounded-lg overflow-hidden border-2 border-pink-200 shadow-md bg-checkerboard">
                <img src={convertedUrl} alt="Converted PNG" className="w-full h-auto" />
              </div>

              <a
                href={convertedUrl}
                download={file ? file.name.replace(/\.[^/.]+$/, '') + ".png" : "converted.png"}
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载 PNG
              </a>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-pink-300 text-sm text-center">
        Powered by Next.js & FFmpeg.wasm<br />
        完全在浏览器本地运行，保护您的隐私
      </footer>
    </main>
  );
}
