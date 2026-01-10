import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Path, Circle, G, Polygon, Filter, DropShadow, FeGaussianBlur, FeMerge, FeMergeNode, Line } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="gradTop1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00d4ff" />
            <Stop offset="100%" stopColor="#0099ff" />
          </LinearGradient>
          <LinearGradient id="gradTop2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00b4ff" />
            <Stop offset="100%" stopColor="#0077ff" />
          </LinearGradient>
          <LinearGradient id="gradTop3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0094ff" />
            <Stop offset="100%" stopColor="#0055ff" />
          </LinearGradient>
          <LinearGradient id="gradLeft1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0066ff" />
            <Stop offset="100%" stopColor="#0033cc" />
          </LinearGradient>
          <LinearGradient id="gradLeft2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0055ff" />
            <Stop offset="100%" stopColor="#0022aa" />
          </LinearGradient>
          <LinearGradient id="gradLeft3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0044ff" />
            <Stop offset="100%" stopColor="#001188" />
          </LinearGradient>
          <LinearGradient id="gradRight1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0088ff" />
            <Stop offset="100%" stopColor="#0044dd" />
          </LinearGradient>
          <LinearGradient id="gradRight2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0077ff" />
            <Stop offset="100%" stopColor="#0033bb" />
          </LinearGradient>
          <LinearGradient id="gradRight3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0066ff" />
            <Stop offset="100%" stopColor="#002299" />
          </LinearGradient>
          <LinearGradient id="gradGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00ffff" />
            <Stop offset="100%" stopColor="#0088ff" />
          </LinearGradient>
          <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="3" result="coloredBlur" />
            <FeMerge>
              <FeMergeNode in="coloredBlur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
          <Filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <DropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" />
          </Filter>
          <Filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <FeMerge>
              <FeMergeNode in="coloredBlur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>
        
        <G filter="url(#shadow)">
          <G filter="url(#glow)">
            <Polygon points="100,20 160,55 160,125 100,160 40,125 40,55" fill="none" stroke="url(#gradGlow)" strokeWidth="2" opacity="0.3" />
            
            <G>
              <Polygon points="100,25 155,57 155,122 100,154 45,122 45,57" fill="url(#gradTop1)" opacity="0.9" />
              <Polygon points="100,25 155,57 155,122 100,154 45,122 45,57" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              
              <Polygon points="100,40 142,64 142,115 100,139 58,115 58,64" fill="url(#gradTop2)" opacity="0.85" />
              <Polygon points="100,40 142,64 142,115 100,139 58,115 58,64" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              
              <Polygon points="100,55 129,72 129,108 100,125 71,108 71,72" fill="url(#gradTop3)" opacity="0.8" />
              <Polygon points="100,55 129,72 129,108 100,125 71,108 71,72" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              
              <Polygon points="100,70 116,79 116,101 100,110 84,101 84,79" fill="url(#gradGlow)" opacity="0.9" filter="url(#innerGlow)" />
              
              <G opacity="0.4">
                <Line x1="100" y1="25" x2="100" y2="154" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <Line x1="45" y1="57" x2="155" y2="122" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <Line x1="45" y1="122" x2="155" y2="57" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
              </G>
            </G>
            
            <G>
              <Polygon points="45,122 100,154 100,185 45,153" fill="url(#gradLeft1)" opacity="0.85" />
              <Polygon points="45,122 100,154 100,185 45,153" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              
              <Polygon points="58,115 100,139 100,162 58,138" fill="url(#gradLeft2)" opacity="0.8" />
              <Polygon points="58,115 100,139 100,162 58,138" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              
              <Polygon points="71,108 100,125 100,140 71,123" fill="url(#gradLeft3)" opacity="0.75" />
              <Polygon points="71,108 100,125 100,140 71,123" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            </G>
            
            <G>
              <Polygon points="100,154 155,122 155,153 100,185" fill="url(#gradRight1)" opacity="0.85" />
              <Polygon points="100,154 155,122 155,153 100,185" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              
              <Polygon points="100,139 142,115 142,138 100,162" fill="url(#gradRight2)" opacity="0.8" />
              <Polygon points="100,139 142,115 142,138 100,162" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              
              <Polygon points="100,125 129,108 129,123 100,140" fill="url(#gradRight3)" opacity="0.75" />
              <Polygon points="100,125 129,108 129,123 100,140" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            </G>
            
            <G opacity="0.5">
              <Circle cx="100" cy="70" r="2" fill="#ffffff" />
              <Circle cx="100" cy="40" r="1.5" fill="#ffffff" />
              <Circle cx="100" cy="55" r="1.2" fill="#ffffff" />
            </G>
            
            <G opacity="0.3">
              <Circle cx="45" cy="122" r="1.5" fill="#ffffff" />
              <Circle cx="58" cy="115" r="1.2" fill="#ffffff" />
              <Circle cx="71" cy="108" r="1" fill="#ffffff" />
            </G>
            
            <G opacity="0.3">
              <Circle cx="155" cy="122" r="1.5" fill="#ffffff" />
              <Circle cx="142" cy="115" r="1.2" fill="#ffffff" />
              <Circle cx="129" cy="108" r="1" fill="#ffffff" />
            </G>
            
            <G opacity="0.25">
              <Circle cx="100" cy="154" r="1.5" fill="#ffffff" />
              <Circle cx="100" cy="139" r="1.2" fill="#ffffff" />
              <Circle cx="100" cy="125" r="1" fill="#ffffff" />
            </G>
            
            <G opacity="0.15">
              <Circle cx="100" cy="185" r="1.5" fill="#ffffff" />
              <Circle cx="45" cy="153" r="1.2" fill="#ffffff" />
              <Circle cx="155" cy="153" r="1.2" fill="#ffffff" />
            </G>
          </G>
          
          <G opacity="0.2">
            <Circle cx="100" cy="70" r="45" fill="none" stroke="url(#gradGlow)" strokeWidth="1" />
            <Circle cx="100" cy="70" r="60" fill="none" stroke="url(#gradGlow)" strokeWidth="0.5" />
          </G>
          
          <G opacity="0.15">
            <Path d="M40,57 L100,25 L160,57" stroke="#ffffff" strokeWidth="0.5" fill="none" />
            <Path d="M45,122 L100,154 L155,122" stroke="#ffffff" strokeWidth="0.5" fill="none" />
            <Path d="M40,57 L45,122 L45,153" stroke="#ffffff" strokeWidth="0.5" fill="none" />
            <Path d="M160,57 L155,122 L155,153" stroke="#ffffff" strokeWidth="0.5" fill="none" />
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Logo;
