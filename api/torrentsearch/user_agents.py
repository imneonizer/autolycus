from random_user_agent.user_agent import UserAgent
from random_user_agent.params import SoftwareName, OperatingSystem
software_names = [SoftwareName.ANDROID.value]
operating_systems = [OperatingSystem.WINDOWS.value, OperatingSystem.LINUX.value, OperatingSystem.MAC.value]   

user_agent_rotator = UserAgent(software_names=software_names, operating_systems=operating_systems, limit=1000)

def get_ua_header(header={}):
    header.update({"User-Agent" : user_agent_rotator.get_random_user_agent()})
    return header

# Get list of user agents.
# user_agents = user_agent_rotator.get_user_agents()
# user_agent_random = user_agent_rotator.get_random_user_agent()