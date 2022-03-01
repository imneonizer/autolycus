import subprocess as sp
import os, glob
import shutil
import inspect

class HlsConverter:
    def __init__(self, ffmpeg="/usr/bin/ffmpeg", ffprobe="/usr/bin/ffprobe"):
        self.ffmpeg = ffmpeg
        self.ffprobe = ffprobe
    
    def exec(self, args):
        args = args.replace('\n', ' ').strip()
        command = f"{self.ffmpeg} {args}"
        return sp.check_output(command, shell=True).decode().strip().split("\n")
    
    def version(self):
        return self.exec('-version')[0]
    
    def get_audio_tracks(self, input_file):
        out = sp.check_output(f""" \
                {self.ffprobe} -v error \
                "{input_file}" \
                -show_entries stream=index:stream_tags=language \
                -select_streams a \
                -of compact=p=0:nk=1 """, shell=True).strip().decode().split("\n")
        return [x for x in out if x]
    
    def get_resolution(self, input_file):
        out = sp.check_output(f""" \
                {self.ffprobe} -v error \
                -select_streams v \
                -show_entries stream=width,height \
                -of csv=p=0:s=x \
                "{input_file}" """, shell=True).strip().decode().split("\n")
        
        return out[0]
        
    def convert_to_hls(self, input_file, output_file, length=10):
        assert os.path.exists(input_file), f"{input_file} doesn't exists"
        
        output_dir = os.path.dirname(output_file)
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        os.makedirs(output_dir, exist_ok=True)
        
        audio_mapping = ' '.join([f'-map 0:{i}' for i in range(len(self.get_audio_tracks(input_file))+1)])
        
        try:
            self.exec(f""" \
                -v error \
                -i '{input_file}' \
                -codec: copy \
                -c:a copy \
                {audio_mapping}
                -start_number 0 \
                -hls_time {length} \
                -hls_list_size 0 \
                -f hls \
                "{output_file}"
            """)
            
            with open(os.path.join(output_dir, ".hlskeep"), "w") as f:
                f.write(os.path.basename(input_file))
        
            if os.path.exists(output_file):
                return output_file
        except sp.CalledProcessError as e:
            print(e)
    
    def convert_to_mp4(self, input_file, output_file):
        assert os.path.exists(input_file), f"{input_file} doesn't exists"
        
        if os.path.exists(output_file):
            os.remove(output_file)
        
        audio_mapping = ' '.join([f'-map 0:{i}' for i in range(len(self.get_audio_tracks(input_file))//2+1)])
        
        try:
            self.exec(f""" \
                -v error \
                -i "{input_file}" \
                -codec: copy -c:a copy \
                {audio_mapping} \
                "{output_file}"
            """)
        except sp.CalledProcessError as e:
            print(e)
            
        if os.path.exists(output_file):
            return output_file
  
hls = HlsConverter()