import { useState, useEffect } from 'react'

const ThemeSelector = () => {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  },[])

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value
    setTheme(selectedTheme)
    document.documentElement.setAttribute('data-theme', selectedTheme)
    localStorage.setItem('theme', selectedTheme)
  }

  const themes = [
    { id: 1, name: 'dark', emoji: '🌑' },
    { id: 2, name: 'retro', emoji: '☎️' },
    { id: 3, name: 'synthwave', emoji: '😎' },
    { id: 4, name: 'night', emoji: '🌙' },
    { id: 5, name: 'coffee', emoji: '☕' },
    { id: 6, name: 'aqua', emoji: '🌊' },
    { id: 7, name: 'sunset', emoji: '🌄' },
    { id: 8, name: 'dracula', emoji: '😈' },
    { id: 9, name: 'abyss', emoji: '👁️' },
    { id: 10, name: 'dim', emoji: '💡' },
    { id: 11, name: 'forest', emoji: '🌳' },
  ]

  const ListItem = ({ name, emoji }) => (
    <li onClick={handleThemeChange}>
      <input
        type="radio"
        name="theme-dropdown"
        className="theme-controller w-full btn btn-sm  btn-ghost justify-start"
        aria-label={name + emoji}
        value={name}
      />
    </li>
  )

  return (
    <div className="dropdown btn-xs btn-primary mb-2">
      <div
        tabIndex={0}
        role="button"
        className="btn m-1 no-drag"
      >
        Theme
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl no-drag"
      >
        {themes.map((theme) => (
          <ListItem key={theme.id} name={theme.name} emoji={theme.emoji} />
        ))}
      </ul>
    </div>
  )
}

export default ThemeSelector
