import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">📈 Stock Dashboard</h1>
        <div className="header-info">
          <span className="market-status">Market Open</span>
        </div>
      </div>
    </header>
  );
};

export default Header;