class API::V1::CurrentUserController < ApplicationController
    before_action :authenticate_user!
  
    def index
      if user_signed_in?
        render json: current_user
      else
        render json: { error: "No user logged in" }, status: :unauthorized
      end
    end
end