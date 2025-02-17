import PropTypes from 'prop-types';
import './video_button.css';

const VideoButton = ({ onClick, children, variant = 'default' }) => {
  return (
    <button className={`custom-button ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

VideoButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'destructive']),
};

export default VideoButton;
