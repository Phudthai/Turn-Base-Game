import React from "react";

interface BattleScreenProps {
  onBack: () => void;
}

export function BattleScreen({ onBack }: BattleScreenProps) {
  return (
    <div className="battle-screen">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
      <h2>⚔️ Battle System</h2>
      <p>Coming Soon...</p>
    </div>
  );
}
