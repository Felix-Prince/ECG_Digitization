import time

from django.shortcuts import render
from django.http import HttpResponse, Http404

import ecgdigitize.ecgdigitize
from .tool import convertECGLeads
from typing import Dict
from model.Lead import Lead, LeadId
from django.views.decorators.csrf import csrf_exempt
import json
from ecgdigitize.image import openImage, ColorImage
from pathlib import Path
from model.InputParameters import InputParameters
from ecgdigitize import common, visualization
from ecgdigitize.image import ColorImage, rotated, Rectangle, cropped
import numpy as np
import cv2
import fitz
import os

names = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']


class NumpyEncoder(json.JSONEncoder):
    """ Special json encoder for numpy types """
    def default(self, obj):
        if isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
                            np.int16, np.int32, np.int64, np.uint8,
                            np.uint16, np.uint32, np.uint64)):
            return int(obj)
        elif isinstance(obj, (np.float_, np.float16, np.float32,
                              np.float64)):
            return float(obj)
        elif isinstance(obj, (np.ndarray,)):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


# Create your views here.
@csrf_exempt
def index(request):
    if request.method == 'GET':
        return render(request, 'index.html')
    if request.method == 'POST':
        file = request.FILES.get('file')
        if file is None:
            return HttpResponse('hello 404')
        file_type = request.POST['type']
        ecg_img_path = './ecg_images/'
        upload_file_path = './ecg_file/'
        if not os.path.exists(ecg_img_path):
            os.mkdir(ecg_img_path)
        if not os.path.exists(upload_file_path):
            os.mkdir(upload_file_path)
        ecg_img_filepath = str
        if file_type == 'jpg':
            ecg_img_filename = 'ecg' + str(time.time()) + '.jpg'
            ecg_img_filepath = ecg_img_path+ecg_img_filename
            with open(ecg_img_filepath, 'wb+') as f:
                for chunk in file.chunks():
                    f.write(chunk)
        elif file_type == 'pdf':
            pdf_filename = 'pdf' + str(time.time()) + '.pdf'
            pdf_filepath = upload_file_path + pdf_filename
            with open(upload_file_path + pdf_filename, 'wb+') as f:
                for chunk in file.chunks():
                    f.write(chunk)
            ecg_img_filename = 'ecg' + str(time.time()) + '.jpg'
            ecg_img_filepath = ecg_img_path + ecg_img_filename
            PdfToJpg(pdf_filepath, ecg_img_filepath)
        color_image = openImage(Path(ecg_img_filepath))
        data = request.POST
        params = json.loads(data['params'])
        print(params)
        leads = {}
        for i in params:
            leads[LeadId[names[i['label']]]] = \
                Lead(x=int(i['x']),
                     y=int(i['y']),
                     width=int(i['width']), height=int(i['height']),
                     startTime=0)
        inputpara = InputParameters(0, 0, 0, leads)
        fullSignals, GirdSignals, preview = convertECGLeads(color_image, inputpara)
        res = {
            'msg': 200,
            'data': [],
        }
        for i in fullSignals.keys():
            one_data = {
                'label': i.value,
                'v_array': fullSignals[i],
                'g_array': GirdSignals[i],
            }
            res['data'].append(one_data)
        for i in preview.keys():
            filename = "./{}.jpg".format(i)
            cv2.imwrite(filename, preview[i].data)
        jsonpak = json.dumps(res, cls=NumpyEncoder)
        return HttpResponse(jsonpak)


def PreViewImage(request):
    if request.method == "GET":
        data = request.GET
        if int(data['label']) >= 0:
            label = int(data['label'])
            filename = "./{}.jpg".format(LeadId[names[label]])
            print(filename)
            return HttpResponse(open(filename, 'rb').read(), content_type='image/jpg')
        else:
            raise Http404("index does not exist")


@csrf_exempt
def PDFfileLoad(request):
    if request.method == 'POST':
        pdf_file = request.FILES.get('pdfFile')
        if pdf_file is None:
            return HttpResponse('hello 404')
        rotate = int(0)
        zoom_x = 1.0
        zoom_y = 1.0
        trans = fitz.Matrix(zoom_x, zoom_y).preRotate(rotate)
        open_file_path = 'pdf_file/'
        save_file_path = 'pdf_image/'
        if not os.path.exists(open_file_path):
            os.mkdir(open_file_path)
        if not os.path.exists(save_file_path):
            os.mkdir(save_file_path)
        filename = 'pdf'+str(time.time())+'.pdf'
        with open(open_file_path + filename, 'wb') as f:
            for chunk in pdf_file.chunks():
                f.write(chunk)
        pdf = fitz.open(open_file_path + filename)
        save_filename = str
        for i in range(pdf.pageCount):
            pm = pdf[i].getPixmap(matrix=trans, alpha=False)
            save_filename = save_file_path + '/%s.png' % i
            pm.writePNG(save_filename)
        return HttpResponse(open(save_filename, 'rb').read(), content_type='image/jpg')


def PdfToJpg(filepath, imgpath):
    rotate = int(0)
    zoom_x = 1.0
    zoom_y = 1.0
    trans = fitz.Matrix(zoom_x, zoom_y).preRotate(rotate)

    pdf = fitz.open(filepath)
    save_filename = str
    for i in range(pdf.pageCount):
        pm = pdf[i].getPixmap(matrix=trans, alpha=False)
        save_filename = imgpath
        pm.writePNG(save_filename)


@csrf_exempt
def newDataUpload(request):
    if request.method == 'POST':
        file = request.FILES.get('file')
        if file is None:
            return HttpResponse('hello 404')
        file_type = request.POST['type']
        ecg_img_path = './ecg_images/'
        upload_file_path = './ecg_file/'
        if not os.path.exists(ecg_img_path):
            os.mkdir(ecg_img_path)
        if not os.path.exists(upload_file_path):
            os.mkdir(upload_file_path)
        ecg_img_filepath = str
        if file_type == 'jpg':
            ecg_img_filename = 'ecg' + str(time.time()) + '.jpg'
            ecg_img_filepath = ecg_img_path + ecg_img_filename
            with open(ecg_img_filepath, 'wb+') as f:
                for chunk in file.chunks():
                    f.write(chunk)

        data = request.POST
        width = float(data['width'])
        height = float(data['height'])
        x = float(data['x'])
        y = float(data['y'])
        this_label = int(data['label'])

        color_image = openImage(Path(ecg_img_filepath))
        to_preview_image = cropped(color_image, Rectangle(int(x), int(y), int(width), int(height)))

        data_array = data['g_array']
        data_array = data_array[1:-1]
        data_array = [float(i) for i in data_array.split(',')]
        data_array = np.array(data_array)
        new_preview = visualization.overlaySignalOnImage(data_array, to_preview_image)
        filename = "./LeadId.{}.jpg".format(names[this_label])
        cv2.imwrite(filename, new_preview.data)

        spaceing = ecgdigitize.digitizeGrid(to_preview_image)
        samplingPeriodInPixels = gridHeightInPixels = common.mean(spaceing)

        new_v_array = ecgdigitize.signal.verticallyScaleECGSignal(
            ecgdigitize.signal.zeroECGSignal(data_array),  # signal
            gridHeightInPixels,  # common.mean(spacings)
            0,  # 用不到
            gridSizeInMillimeters=1.0
        )
        res = {
            'msg': 200,
            'data': [],
        }
        res['data'].append(new_v_array)
        jsonpak = json.dumps(res, cls=NumpyEncoder)
        return HttpResponse(jsonpak)


