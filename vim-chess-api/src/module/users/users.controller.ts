import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERROR } from '../../common/constants/error.constants';
import { UserEntity } from './entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/strategy/jwt-auth.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':uid')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@GetUser() user: UserEntity, @Param('uid') uid: string) {
    if (uid != 'me') {
      try {
        user = await this.usersService.findOne(uid);
      } catch (e) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }
    }
    if (!user) {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }
    return new UserEntity(user);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(uid, updateUserDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.usersService.remove(uid);
  }
}
