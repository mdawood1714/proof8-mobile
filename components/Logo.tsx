import Svg, { Path } from 'react-native-svg';

export const Logo = ({ size = 28, color = '#111111' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M64.008 0h63.976v64.007H64.008v63.972H-.002V0h64.01zM95.99 95.993H160V160H95.99V95.993z"
      fill={color}
    />
  </Svg>
);
