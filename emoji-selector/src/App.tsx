import React, { useState, useEffect } from "react";
import "./App.css";

// 定义emoji列表
const EMOJI_LIST = ["😀", "😂", "🥰", "😎", "🤔", "😴", "🥳", "😍", "🤓", "😇"];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // 生成两个随机emoji
  const generateRandomEmojis = () => {
    const shuffled = [...EMOJI_LIST].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  // 初始化或重置游戏
  useEffect(() => {
    if (currentStep === 0) {
      setCurrentOptions(generateRandomEmojis());
    }
  }, [currentStep]);

  // 处理选择
  const handleSelection = (selectedEmoji: string) => {
    const newSelections = [...selections, selectedEmoji];
    setSelections(newSelections);

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setCurrentOptions(generateRandomEmojis());
    } else {
      setIsComplete(true);
    }
  };

  // 重置游戏
  const resetGame = () => {
    setCurrentStep(0);
    setSelections([]);
    setCurrentOptions(generateRandomEmojis());
    setIsComplete(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Emoji 选择器</h1>
        {!isComplete ? (
          <div className="selection-container">
            <p>第 {currentStep + 1} 次选择 (共5次)</p>
            <div className="emoji-options">
              {currentOptions.map((emoji, index) => (
                <button
                  key={index}
                  className="emoji-button"
                  onClick={() => handleSelection(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="results-container">
            <h2>你的选择是：</h2>
            <div className="selected-emojis">
              {selections.map((emoji, index) => (
                <span key={index} className="selected-emoji">
                  {emoji}
                </span>
              ))}
            </div>
            <button className="reset-button" onClick={resetGame}>
              重新开始
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
