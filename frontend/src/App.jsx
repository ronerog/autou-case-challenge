import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const SunIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.275l.707-.707a.75.75 0 00-1.06-1.06l-.707.707a.75.75 0 001.06 1.06zM3.705 19.295l.707-.707a.75.75 0 00-1.06-1.06l-.707.707a.75.75 0 001.06 1.06zM12 7a5 5 0 100 10 5 5 0 000-10z"
    ></path>
  </svg>
);
const MoonIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z"
    ></path>
  </svg>
);
const UploadIcon = () => (
  <svg
    className="w-8 h-8 text-gray-400 dark:text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z"
    ></path>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 12v-4m0 4h4m-4 0H8"
    ></path>
  </svg>
);
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
const CloseIcon = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    ></path>
  </svg>
);

function App() {
  const [emailText, setEmailText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.2);
  const [copied, setCopied] = useState(false);
  const [variationLoading, setVariationLoading] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState(
    () => JSON.parse(localStorage.getItem("savedPrompts")) || []
  );
  const [promptName, setPromptName] = useState("");

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError("");
    setFile(null);
    if (fileRejections.length > 0) {
      setError(
        "Formato de arquivo inválido. Por favor, envie apenas arquivos .txt ou .pdf."
      );
    } else if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"], "application/pdf": [".pdf"] },
    multiple: false,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    if (!emailText.trim() && !file) {
      setError("Por favor, insira um texto ou envie um arquivo.");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("email_text", emailText);
    if (file) formData.append("file", file);
    formData.append("custom_prompt", customPrompt);
    formData.append("temperature", temperature);
    try {
      const response = await axios.post(
        "http://localhost:8000/process-email",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Ocorreu um erro ao processar o email."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCopyToClipboard = () => {
    if (!result?.suggested_response) return;
    navigator.clipboard.writeText(result.suggested_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleVariation = async (variationType) => {
    if (!result?.suggested_response) return;
    setVariationLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/refine-response",
        {
          original_response: result.suggested_response,
          variation_type: variationType,
        }
      );
      setResult((prev) => ({
        ...prev,
        suggested_response: response.data.refined_response,
      }));
    } catch (err) {
      setError("Não foi possível gerar a variação da resposta.");
    } finally {
      setVariationLoading(false);
    }
  };
  const savePrompt = () => {
    if (!customPrompt.trim() || !promptName.trim()) return;
    const newPrompts = [
      ...savedPrompts,
      { name: promptName, text: customPrompt },
    ];
    setSavedPrompts(newPrompts);
    localStorage.setItem("savedPrompts", JSON.stringify(newPrompts));
    setPromptName("");
  };
  const loadPrompt = (promptText) => {
    setCustomPrompt(promptText);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">
            Analisador de Emails com IA
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Cole um e-mail ou dê uma instrução para a análise do arquivo..."
                rows="8"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700/50"
              />
              <div className="text-center text-gray-500 dark:text-gray-400 font-bold">
                +
              </div>
              <div
                {...getRootProps()}
                className={`p-4 sm:p-6 border-2 border-dashed rounded-md cursor-pointer text-center transition-colors ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  {file ? (
                    <div className="relative bg-indigo-100 dark:bg-indigo-800/50 text-indigo-800 dark:text-indigo-100 py-1 px-4 rounded-full mt-2 inline-flex items-center text-sm font-medium pr-8">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="absolute top-0 right-0 h-full w-8 flex items-center justify-center text-indigo-600 dark:text-indigo-200 hover:text-red-700 dark:hover:text-red-400 rounded-r-full"
                        aria-label="Remover arquivo"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {isDragActive
                          ? "Solte o arquivo aqui!"
                          : "Arraste um arquivo ou clique para selecionar"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800 dark:text-gray-200"
                >
                  {" "}
                  Opções Avançadas{" "}
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="customPrompt"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Instrução Adicional:
                      </label>
                      <textarea
                        id="customPrompt"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Ex: Responda em tom informal e use emojis."
                        rows="2"
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/50"
                      />
                      <div className="flex flex-wrap items-center mt-2 gap-2">
                        <input
                          type="text"
                          value={promptName}
                          onChange={(e) => setPromptName(e.target.value)}
                          placeholder="Nome do template"
                          className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 text-sm min-w-[120px]"
                        />
                        <button
                          type="button"
                          onClick={savePrompt}
                          className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                        >
                          Salvar
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {savedPrompts.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => loadPrompt(p.text)}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="temperature"
                        className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        <span>Criatividade (Temperatura)</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {temperature.toFixed(1)}
                        </span>
                      </label>
                      <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) =>
                          setTemperature(parseFloat(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (!emailText.trim() && !file)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner /> : "Analisar"}
              </button>
            </form>
          </div>

          <div className="lg:sticky top-8 h-fit space-y-6">
            {error && (
              <div
                className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-r-lg"
                role="alert"
              >
                <p className="font-bold">Erro</p>
                <p>{error}</p>
              </div>
            )}

            {loading && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-8 mt-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-6 mt-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-20 mt-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg h-full flex flex-col justify-center items-center text-center">
                <svg
                  className="w-16 h-16 text-gray-300 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">
                  Aguardando Análise
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Os resultados da sua análise aparecerão aqui.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {result.suggested_action &&
                  result.suggested_action !== "Nenhuma sugestão de ação" && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                      <h3 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        ⚡ Próxima Ação Sugerida:
                      </h3>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        {result.suggested_action}
                      </p>
                    </div>
                  )}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">
                    Classificação:
                  </h3>
                  <p
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      result.classification === "Produtivo"
                        ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100"
                        : "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100"
                    }`}
                  >
                    {result.classification}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                  <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Resposta Sugerida:
                    </h3>
                    <button
                      onClick={handleCopyToClipboard}
                      className="px-3 py-1 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-200 dark:border-gray-700 text-sm sm:text-base">
                    {result.suggested_response}
                  </div>
                  <div className="mt-4 flex items-center flex-wrap gap-3">
                    <span className="text-sm font-medium">Refinar tom:</span>
                    <button
                      onClick={() => handleVariation("formal")}
                      disabled={variationLoading}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 rounded-full disabled:opacity-50"
                    >
                      Formal
                    </button>
                    <button
                      onClick={() => handleVariation("casual")}
                      disabled={variationLoading}
                      className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/50 rounded-full disabled:opacity-50"
                    >
                      Casual
                    </button>
                    <button
                      onClick={() => handleVariation("summarize")}
                      disabled={variationLoading}
                      className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/50 rounded-full disabled:opacity-50"
                    >
                      Resumir
                    </button>
                    {variationLoading && (
                      <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-gray-500"></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
