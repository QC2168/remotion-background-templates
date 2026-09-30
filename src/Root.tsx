import React from 'react';
import {Composition} from 'remotion';
import {BACKGROUNDS,IDS} from './Backgrounds';
export const Root: React.FC = () => <>{BACKGROUNDS.map((component,i)=><Composition key={IDS[i]} id={IDS[i]} component={component} width={1920} height={1080} fps={30} durationInFrames={180} defaultProps={{color:i>=10?'#bebebe':'#aeb6c2',intensity:1,speed:(i===3||i===4)?2:1,seed:42}}/>)}</>;
