from argparse import ArgumentParser
import ipdb
import sys
import traceback
import os


 
if __name__ == "__main__":
	try:
		os.environ['FLASK_MOCK_DB'] = "true"
		from app.server import app

		print("http://127.0.0.1:5000/?user_id=manuel&experiment=chatbot_personalization_eval_23_09_28")
  
		print("http://127.0.0.1:5000/?user_id=manuel&experiment=chatbot_personalization_eval_23_09_28_strict")
		app.run()

	except:
		extype, value, tb = sys.exc_info()
		traceback.print_exc()
		ipdb.post_mortem(tb)
