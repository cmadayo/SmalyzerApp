import eel
import os
import analyze_video
from bottle import route, request, response, static_file, HTTPResponse
from io import BytesIO
from pathlib import Path
from PIL import Image

#########################
# SETTING
#########################
data_dirname = 'data'                 # data directory
npdata_dirname = 'npdata'           # graph directory for saving figure image
static_uri = 'http://localhost:8000/graph'   # static file directory
#########################


def get_path(dirname):
    path_root = (Path(__file__) / '..').resolve()
    path_dir = path_root / dirname
    return path_dir


def get_path_of_video_and_npz(video_filename):
    path_data = get_path(data_dirname)
    path_video = path_data / video_filename

    path_npdata = get_path(npdata_dirname)
    # change extension from mp4 to npz
    npz_filename = path_video.stem + '.npz'
    path_npz = path_npdata / npz_filename

    return path_video, path_npz


@eel.expose
def python_get_files():
    # get data directory path
    path_data = get_path(data_dirname)
    it_mp4_files = path_data.glob('*.mp4')

    files = []
    for mp4_file in it_mp4_files:
        files.append(mp4_file.name)

    return files


# @eel.expose
@eel.btl.route('/show')
def python_get_uri_of_result_file():
    # image_filename = Path(video_filename).stem + '.png'
    # image_uri = '/'.join([static_uri, image_filename])
    # return image_uri

    video_filename = request.query.get('target')
    _, path_npz = get_path_of_video_and_npz(video_filename)

    output = analyze_video.get_figure_in_BytesIO(str(path_npz))

    res = HTTPResponse(status=200, body=output.getvalue())
    res.set_header('Content-Type', 'image/png')
    return res


@eel.expose
def python_run_analyze(video_filename):
    path_video, path_npz = get_path_of_video_and_npz(video_filename)

    analyze_video.run(str(path_video), str(path_npz))

    return


@eel.btl.route('/upload/', method='POST')
def upload():
    # make video file's uri
    data_dir = get_path(data_dirname)
    file = request.files.get('file')
    file.save(str(data_dir), overwrite=True)
    return 'OK'


eel.init("web")
eel.start("main.html", size=(1024, 800))
