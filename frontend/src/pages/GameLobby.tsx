import React, { useRef, useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";
import "../styles/animations.css";
import "../styles/components/buttons.css";
import "./GameLobby.css";

type GameState =
  | "lobby"
  | "gacha"
  | "inventory"
  | "battle"
  | "settings"
  | "campaign"
  | "arena"
  | "market"
  | "guild"
  | "dungeon"
  | "achievements"
  | "statistics";

interface GameLobbyProps {
  onNavigate: (screen: GameState) => void;
}

interface Position {
  x: number;
  y: number;
}

interface ContentArea {
  id: string;
  name: string;
  position: Position;
  size: { width: number; height: number };
  icon: string;
  description: string;
  unlocked: boolean;
  notification?: number;
}

export function GameLobby({ onNavigate }: GameLobbyProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [cameraPosition, setCameraPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  // Define content areas in the lobby
  const contentAreas: ContentArea[] = [
    {
      id: "gacha",
      name: "Gacha",
      position: { x: 200, y: 150 },
      size: { width: 120, height: 120 },
      icon: "🌟",
      description: "Summon new characters and items",
      unlocked: true,
      notification: 1,
    },
    {
      id: "campaign",
      name: "Campaign",
      position: { x: 400, y: 200 },
      size: { width: 130, height: 120 },
      icon: "🗺️",
      description: "Embark on epic adventures",
      unlocked: true,
    },
    {
      id: "arena",
      name: "Arena",
      position: { x: 600, y: 180 },
      size: { width: 140, height: 120 },
      icon: "⚔️",
      description: "Battle against other players",
      unlocked: !!user?.level && user.level >= 3,
    },
    {
      id: "market",
      name: "Market",
      position: { x: 150, y: 350 },
      size: { width: 110, height: 100 },
      icon: "🏪",
      description: "Buy and sell items",
      unlocked: true,
    },
    {
      id: "guild",
      name: "Guild",
      position: { x: 450, y: 400 },
      size: { width: 130, height: 110 },
      icon: "🏰",
      description: "Join a guild and socialize",
      unlocked: !!user?.level && user.level >= 5,
    },
    {
      id: "dungeon",
      name: "Dungeon",
      position: { x: 700, y: 350 },
      size: { width: 120, height: 130 },
      icon: "🏔️",
      description: "Explore dangerous dungeons",
      unlocked: !!user?.level && user.level >= 10,
    },
  ];

  // Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left mouse button
        setIsDragging(true);
        setDragStart({
          x: e.clientX - cameraPosition.x,
          y: e.clientY - cameraPosition.y,
        });
      }
    },
    [cameraPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Limit camera movement bounds
        const maxX = 200;
        const minX = -600;
        const maxY = 100;
        const minY = -400;

        setCameraPosition({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - cameraPosition.x,
        y: touch.clientY - cameraPosition.y,
      });
    },
    [cameraPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        const maxX = 200;
        const minX = -600;
        const maxY = 100;
        const minY = -400;

        setCameraPosition({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle area click
  const handleAreaClick = (areaId: string) => {
    if (!contentAreas.find((area) => area.id === areaId)?.unlocked) return;

    setSelectedArea(areaId);

    // Navigate to the selected area
    setTimeout(() => {
      onNavigate(areaId as GameState);
      setSelectedArea(null);
    }, 300);
  };

  // Cleanup mouse events
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mouseleave", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mouseleave", handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="game-lobby">
      {/* Enhanced Header */}
      <div className="lobby-header">
        <div className="header-logo">
          <span className="game-title">⚔️ Picoen</span>
        </div>

        <div className="currency-display">
          <div className="currency-item">
            <span className="currency-icon">💎</span>
            <span className="currency-amount">
              {user?.currency?.gems?.toLocaleString() || 0}
            </span>
          </div>
          <div className="currency-item">
            <span className="currency-icon">🪙</span>
            <span className="currency-amount">
              {user?.currency?.coins?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Card - Separate from Navbar */}
      <div className="user-profile-card">
        <div className="profile-row">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
            <div className="avatar-level">{user?.level || 1}</div>
            {/* notification badge, if any, can be added here */}
          </div>
          <div className="profile-username">{user?.username}</div>
        </div>
        <div className="exp-bar-container">
          <div className="exp-bar">
            <div
              className="exp-fill"
              style={{
                width: `${Math.max(8, (user?.experience || 0) % 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Game World */}
      <div
        ref={containerRef}
        className={`lobby-world ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="world-background"
          style={{
            transform: `translate(${cameraPosition.x}px, ${cameraPosition.y}px)`,
          }}
        >
          {/* Enhanced Background Elements */}
          <div className="bg-mountain bg-element-1"></div>
          <div className="bg-mountain bg-element-2"></div>
          <div className="bg-cloud bg-element-3"></div>
          <div className="bg-cloud bg-element-4"></div>

          {/* New Enhanced Building Structures */}
          <div className="bg-castle">
            <div className="castle-tower castle-tower-1"></div>
            <div className="castle-tower castle-tower-2"></div>
            <div className="castle-tower castle-tower-3"></div>
            <div className="castle-main"></div>
            <div className="castle-gate"></div>
            <div className="castle-flag"></div>
          </div>

          <div className="bg-magical-tree">
            <div className="tree-trunk"></div>
            <div className="tree-crown"></div>
            <div className="tree-glow"></div>
            <div className="tree-particles"></div>
          </div>

          <div className="bg-crystal-formation">
            <div className="crystal crystal-1"></div>
            <div className="crystal crystal-2"></div>
            <div className="crystal crystal-3"></div>
            <div className="crystal-base"></div>
          </div>

          <div className="bg-floating-island">
            <div className="island-base"></div>
            <div className="island-vegetation"></div>
            <div className="island-waterfall"></div>
          </div>

          {/* Enhanced Tree Elements */}
          <div className="bg-tree bg-element-5">
            <div className="tree-trunk-detail"></div>
            <div className="tree-leaves"></div>
            <div className="tree-shadow"></div>
          </div>
          <div className="bg-tree bg-element-6">
            <div className="tree-trunk-detail"></div>
            <div className="tree-leaves"></div>
            <div className="tree-shadow"></div>
          </div>

          {/* Content Areas with Enhanced Styling */}
          <div className="content-areas">
            <div className="content-areas-container">
              {contentAreas.map((area) => (
                <div
                  key={area.id}
                  className={`content-area ${area.unlocked ? "" : "locked"} ${
                    hoveredArea === area.id ? "hovered" : ""
                  } ${selectedArea === area.id ? "selected" : ""}`}
                  style={{
                    left: area.position.x,
                    top: area.position.y,
                    width: area.size.width,
                    height: area.size.height,
                  }}
                  onMouseEnter={() => setHoveredArea(area.id)}
                  onMouseLeave={() => setHoveredArea(null)}
                  onClick={() => handleAreaClick(area.id)}
                >
                  <div className="area-background">
                    <div className="area-structure">
                      {area.id === "gacha" && (
                        <div className="portal-structure">
                          <div className="portal-ring portal-ring-1"></div>
                          <div className="portal-ring portal-ring-2"></div>
                          <div className="portal-center"></div>
                          <div className="portal-energy"></div>
                        </div>
                      )}
                      {area.id === "campaign" && (
                        <div className="campaign-structure">
                          <div className="campaign-map"></div>
                          <div className="campaign-path"></div>
                          <div className="campaign-markers"></div>
                        </div>
                      )}
                      {area.id === "arena" && (
                        <div className="arena-structure">
                          <div className="arena-walls"></div>
                          <div className="arena-floor"></div>
                          <div className="arena-stands"></div>
                        </div>
                      )}
                      {area.id === "market" && (
                        <div className="shop-structure">
                          <div className="shop-roof"></div>
                          <div className="shop-walls"></div>
                          <div className="shop-door"></div>
                          <div className="shop-sign"></div>
                        </div>
                      )}
                      {area.id === "guild" && (
                        <div className="guild-structure">
                          <div className="guild-hall"></div>
                          <div className="guild-towers"></div>
                          <div className="guild-banner"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="area-icon">{area.icon}</div>

                  <div className="area-name">{area.name}</div>

                  {area.notification && (
                    <div className="notification-badge">
                      {area.notification}
                    </div>
                  )}

                  {!area.unlocked && (
                    <div className="lock-overlay">
                      <span className="lock-icon">🔒</span>
                    </div>
                  )}

                  {/* Enhanced Tooltip */}
                  {hoveredArea === area.id && (
                    <div className="area-tooltip">
                      <h4>{area.name}</h4>
                      <p>{area.description}</p>
                      {!area.unlocked && (
                        <div className="unlock-requirement">
                          Unlock at level{" "}
                          {area.id === "arena"
                            ? 3
                            : area.id === "guild"
                            ? 5
                            : area.id === "dungeon"
                            ? 10
                            : 15}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Floating Particles Effect */}
          <div className="floating-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${10 + Math.random() * 10}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Menu */}
      <div className="bottom-menu">
        <button className="menu-button" onClick={() => onNavigate("inventory")}>
          🎒
        </button>
        <button className="menu-button" onClick={() => onNavigate("battle")}>
          ⚔️
        </button>
        <button
          className="menu-button"
          onClick={() => onNavigate("achievements")}
        >
          🏆
        </button>
        <button
          className="menu-button"
          onClick={() => onNavigate("statistics")}
        >
          📊
        </button>
        <button className="menu-button" onClick={() => onNavigate("settings")}>
          ⚙️
        </button>
      </div>

      {/* Instructions */}
      <div className="lobby-instructions">
        <p>🖱️ Drag to explore • 👆 Tap areas to enter</p>
      </div>
    </div>
  );
}
