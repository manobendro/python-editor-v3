/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  AspectRatio,
  Box,
  Flex,
  usePrevious,
  useToken,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IntlShape, useIntl } from "react-intl";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { topBarHeight } from "../deployment/misc";
import { DeviceContextProvider } from "../device/device-hooks";
import { SimulatorDeviceConnection } from "../device/simulator";
// import { stage } from "../environment";
import { useLogging } from "../logging/logging-hooks";
import SimulatorActionBar from "./SimulatorActionBar";
import SimulatorSplitView from "./SimulatorSplitView";
import SimSerialTabControlProvider from "./tab-control-hooks";

export enum RunningStatus {
  RUNNING,
  STOPPED,
}

interface SimulatorProps {
  shown: boolean;
  onSimulatorHide: () => void;
  showSimulatorButtonRef: React.RefObject<HTMLButtonElement>;
  minWidth: number;
  simFocus: boolean;
}

const Simulator = ({
  shown,
  onSimulatorHide,
  showSimulatorButtonRef,
  minWidth,
  simFocus,
}: SimulatorProps) => {
  // const production =
  //   "https://python-simulator.usermbit.org/v/0.1/simulator.html";
  // const staging =
  //   "https://python-simulator.usermbit.org/staging/simulator.html";
  // const url = stage === "PRODUCTION" ? production : staging;
  // For testing with sim branches:
  //const branch = "upgrade-mpy";
  // const url = 'https://4000-monospace-python-editor-v3-1715611503795.cluster-e3wv6awer5h7kvayyfoein2u4a.cloudworkstations.dev/simulator.html';
  const url = 'https://simulator.bitsflowlab.xyz/simulator.html';

  const ref = useRef<HTMLIFrameElement>(null);
  const intl = useIntl();
  const logging = useLogging();
  const simulatorTitle = intl.formatMessage({ id: "simulator-title" });
  const simulator = useRef(
    new SimulatorDeviceConnection(logging, () => {
      return ref.current;
    })
  );
  useEffect(() => {
    const sim = simulator.current;
    sim.initialize();
    return () => {
      sim.dispose();
    };
  }, []);
  useEffect(() => {
    updateTranslations(simulator.current, intl);
  }, [simulator, intl]);
  const simControlsRef = useRef<HTMLDivElement>(null);
  const [brand500] = useToken("colors", ["brand.500"]);
  const [running, setRunning] = useState<RunningStatus>(RunningStatus.STOPPED);
  const previouslyShown = usePrevious(shown);

  useEffect(() => {
    if (shown) {
      // Prevents the simulator stealing focus on initial load.
      if (previouslyShown !== undefined && previouslyShown !== shown) {
        ref.current!.focus();
      }
    } else {
      if (simFocus) {
        showSimulatorButtonRef.current!.focus();
      }
    }
  }, [previouslyShown, showSimulatorButtonRef, shown, simFocus]);

  return (
    <DeviceContextProvider value={simulator.current}>
      <Flex
        flex="1 1 100%"
        flexDirection="column"
        height="100%"
        position="relative"
      >
        <Flex
          position="absolute"
          top={0}
          left={0}
          alignItems="center"
          height={topBarHeight}
        >
          <HideSplitViewButton
            aria-label={intl.formatMessage({ id: "simulator-collapse" })}
            onClick={onSimulatorHide}
            splitViewShown={shown}
            direction="expandLeft"
          />
        </Flex>
        <VStack spacing={5} bg="gray.25" ref={simControlsRef}>
          <Box width="100%" pb={1} px={5} maxW="md" minW={minWidth}>
            <AspectRatio ratio={1/1} width="100%">
              <Box
                ref={ref}
                as="iframe"
                src={`${url}?color=${encodeURIComponent(brand500)}`}
                title={simulatorTitle}
                name={simulatorTitle}
                frameBorder="no"
                scrolling="no"
                allow="autoplay;microphone"
                sandbox="allow-scripts allow-same-origin"
              />
            </AspectRatio>
            <SimulatorActionBar
              as="section"
              aria-label={intl.formatMessage({ id: "simulator-actions" })}
              overflow="hidden"
              running={running}
              onRunningChange={setRunning}
            />
          </Box>
        </VStack>
        <SimSerialTabControlProvider>
          <SimulatorSplitView simRunning={running} />
        </SimSerialTabControlProvider>
      </Flex>
    </DeviceContextProvider>
  );
};

const updateTranslations = (
  simulator: SimulatorDeviceConnection,
  intl: IntlShape
) => {
  const config = {
    language: intl.locale,
    translations: Object.fromEntries(
      ["button-a", "button-b", "touch-logo", "start-simulator"].map((k) => [
        k,
        intl.formatMessage({ id: "simulator-" + k }),
      ])
    ),
  };
  simulator.configure(config);
};

export default Simulator;
