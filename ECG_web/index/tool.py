# =======================classes==================
from enum import Enum
import dataclasses
from typing import Dict
from ecgdigitize import common, visualization
import ecgdigitize
from ecgdigitize.image import ColorImage, rotated, Rectangle, cropped


class LeadId(Enum):
    """Enumerates the different names for leads

    `Enum` provides lots of awesome functionality:

      - Check if a string is a valid member of this enum:
        ```
        someString in Lead.__members__
        ```

      - Convert a string to enum:
        ```
        myLead = Lead[someString]
        ```
    """

    I   = 0
    II  = 1
    III = 2
    aVR = 3
    aVL = 4
    aVF = 5
    V1  = 6
    V2  = 7
    V3  = 8
    V4  = 9
    V5  = 10
    V6  = 11

    def __repr__(self) -> str:
        names = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']
        return names[self.value]


@dataclasses.dataclass(frozen=True)
class Lead:
    x: int
    y: int
    width: int
    height: int
    startTime: int


@dataclasses.dataclass(frozen=True)
class InputParameters:
    rotation: int
    timeScale: int
    voltScale: int
    leads: Dict[LeadId, Lead]


# =======================process==================
def convertECGLeads(inputImage: ColorImage, parameters: InputParameters):
    # Apply rotation
    rotatedImage = rotated(inputImage, parameters.rotation)

    # Crop each lead
    leadImages = {
        leadId: cropped(rotatedImage, Rectangle(lead.x, lead.y, lead.width, lead.height))
        for leadId, lead in parameters.leads.items()
    }

    extractSignal = ecgdigitize.digitizeSignal
    extractGrid   = ecgdigitize.digitizeGrid

    # Map all lead images to signal data
    signals = {
        leadId: extractSignal(leadImage)
        for leadId, leadImage in leadImages.items()
    }

    # If all signals failed -> Failure
    if all([isinstance(signal, common.Failure) for _, signal in signals.items()]):
        return None, None

    previews = {
        leadId: visualization.overlaySignalOnImage(signal, image)
        for (leadId, image), (_, signal) in zip(leadImages.items(), signals.items())
    }

    # Map leads to grid size estimates
    gridSpacings = {
        leadId: extractGrid(leadImage)
        for leadId, leadImage in leadImages.items()
    }

    # Just got successful spacings
    spacings = [spacing for spacing in gridSpacings.values() if not isinstance(spacing, common.Failure)]

    if len(spacings) == 0:
        return None, None

    samplingPeriodInPixels = gridHeightInPixels = common.mean(spacings)

    GirdSignals = {
        leadId: signal
        for leadId, signal in signals.items()
    }

    # Scale signals
    # TODO: Pass in the grid size in mm
    scaledSignals = {
        #  =  signal * microVoltsPerPixel * -1
        # microVoltsPerPixel = gridsPerPixel(1 / gridSizeInPixels) * millimetersPerGrid(gridSizeInMillimeters)
        #                   * milliVoltsPerMillimeter(1 / millimetersPerMilliVolt(10.0))
        #                                               *microVoltsPerMilliVolt(1000)
        # microVoltsPerPixel =  (1 / gridSizeInPixels) * gridSizeInMillimeters * (1 / 10.0) * 1000

        # RES: scaledSignals = signal * (1 / gridSizeInPixels) * gridSizeInMillimeters * 100.0 * (-1)
        # 逆   signal = (scaledSignal * gridSizeInPixels) / gridSizeInMillmeters * 100 * (-1)
        #      (Gird)signal =  (scaledSignal * gridSizeInPixels) / (-100)
        leadId: ecgdigitize.signal.verticallyScaleECGSignal(
            ecgdigitize.signal.zeroECGSignal(signal),  # signal
            gridHeightInPixels,  # common.mean(spacings)
            parameters.voltScale,  # 用不到
            gridSizeInMillimeters=1.0
        )
        for leadId, signal in signals.items()
    }

    # TODO: Pass in the grid size in mm
    samplingPeriod = ecgdigitize.signal.ecgSignalSamplingPeriod(
        # secondsPerPixel = gridsPerPixel(1 / gridSizeInPixels) * millimetersPerGrid(gridSizeInMillimeters)
        #                           * secondsPerMillimeter(1 / millimetersPerSecond(25.0))
        # RES:  secondsPerPixel = (1 / gridSizeInPixels) * gridSizeInMillimeters * (1 / 25.0)  -> float
        samplingPeriodInPixels,
        parameters.timeScale,
        gridSizeInMillimeters=1.0)

    # 3. Zero pad all signals on the left based on their start times and the samplingPeriod
    # take the max([len(x) for x in signals]) and zero pad all signals on the right
    paddedSignals = {
        # common.padleft(signal, 0)
        # RES: [0] * (1 / samplingPeriod) + signal -> np.narray
        # startTime = 0 时  paddedSignals = signal -> scaledSignals
        leadId: common.padLeft(signal, int(parameters.leads[leadId].startTime / samplingPeriod))
        for leadId, signal in scaledSignals.items()
    }

    # (should already be handled by (3)) Replace any None signals with all zeros
    maxLength = max([len(s) for _, s in paddedSignals.items()])  # 最多的信号 那一条
    fullSignals = {
        # 为不够长度的条目添零 到最大长度
        # 单个的话 fullSignal = paddedSignals
        leadId: common.padRight(signal, maxLength - len(signal))
        for leadId, signal in paddedSignals.items()
    }

    return fullSignals, GirdSignals, previews


def processEcgData(colorimage, inputParameters):
        extractedSignals, previewImages = convertECGLeads(colorimage, inputParameters)

        if extractedSignals is None:  # error process
            errorMsg = {
                'message': "Error: Signal Processing Failed\n\nPlease check your lead selection boxes",
                'type': "Error"
            }
            return errorMsg
        else:  # well down
            successMsg = {
                'image': previewImages,
                'signals': extractedSignals
            }
            return successMsg
